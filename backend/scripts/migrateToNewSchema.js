/**
 * UNITEE Database Migration Script
 * Migrates from single `users` collection to:
 *   - volunteers
 *   - organizations
 *   - admins
 *
 * Run ONCE: node scripts/migrateToNewSchema.js
 * Safe to run multiple times (checks for existing records).
 */

require('dotenv').config();
const mongoose = require('mongoose');

// Old model
const User = require('../src/models/User');

// New models
const Volunteer = require('../src/models/Volunteer');
const Organization = require('../src/models/Organization');
const Admin = require('../src/models/Admin');

async function migrate() {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/volunteer_app');
  console.log('Connected to MongoDB');

  const users = await User.find({}).select('+password').lean();
  console.log(`Found ${users.length} users to migrate`);

  let volunteers = 0, orgs = 0, admins = 0, skipped = 0;

  for (const u of users) {
    try {
      if (u.role === 'user') {
        const exists = await Volunteer.findOne({ email: u.email });
        if (exists) { skipped++; continue; }

        await Volunteer.create({
          _id: u._id, // preserve original ID so references don't break
          googleId: u.googleId,
          name: u.name,
          email: u.email,
          password: u.password, // already hashed — skip pre-save hook
          verification: {
            emailVerified: u.emailVerified || false,
            isVerified: u.isVerified || false,
            emailVerificationToken: u.emailVerificationToken,
            passwordResetToken: u.passwordResetToken,
            passwordResetExpires: u.passwordResetExpires,
          },
          profile: {
            avatar: u.profile?.avatar_url || u.profile?.avatar,
            phone: u.profile?.phone,
            city: u.profile?.location?.city || u.profile?.city,
            country: u.profile?.location?.country || u.profile?.country || 'Cameroon',
            bio: u.profile?.bio,
            skills: u.profile?.skills || [],
            interests: u.profile?.interests || [],
            dateOfBirth: u.profile?.dateOfBirth,
          },
          stats: {
            totalHours: u.stats?.totalHours || 0,
            totalEvents: u.stats?.totalEvents || 0,
            peopleHelped: u.stats?.peopleHelped || 0,
            badges: u.stats?.badges || [],
          },
          preferences: u.preferences || {},
          communities: u.communities || [],
          isActive: u.isActive !== false,
          lastActive: u.lastActive || u.createdAt,
          createdAt: u.createdAt,
        });
        volunteers++;

      } else if (u.role === 'organizer') {
        const exists = await Organization.findOne({ 'account.email': u.email });
        if (exists) { skipped++; continue; }

        // Use insertOne to bypass pre-save password hashing (password already hashed)
        await Organization.collection.insertOne({
          _id: u._id,
          account: {
            name: u.name,
            email: u.email,
            password: u.password,
            emailVerified: u.emailVerified || false,
            emailVerificationToken: u.emailVerificationToken,
            passwordResetToken: u.passwordResetToken,
            passwordResetExpires: u.passwordResetExpires,
          },
          organization: {
            name: u.organizationName || u.name,
            description: u.organizationDescription,
            website: u.organizationWebsite,
            type: u.organizationType,
            phone: u.organizationPhone || u.profile?.phone,
            city: u.organizationCity || u.profile?.location?.city,
            region: u.organizationRegion,
            logo: u.organizationLogo,
            banner: u.organizationBanner,
          },
          verification: {
            status: u.organizationVerificationStatus || 'pending',
          },
          stats: { eventsCreated: 0, volunteersEngaged: 0, certificatesIssued: 0 },
          preferences: u.preferences || {},
          isActive: u.isActive !== false,
          lastActive: u.lastActive || u.createdAt,
          createdAt: u.createdAt,
        });
        orgs++;

      } else if (u.role === 'admin') {
        const exists = await Admin.findOne({ email: u.email });
        if (exists) { skipped++; continue; }

        await Admin.collection.insertOne({
          _id: u._id,
          name: u.name,
          email: u.email,
          password: u.password,
          adminRole: 'super_admin',
          permissions: Admin.ROLE_PERMISSIONS.super_admin,
          status: 'active',
          profile: { avatar: u.profile?.avatar_url || u.profile?.avatar },
          createdBy: null,
          verification: {},
          lastActive: u.lastActive || u.createdAt,
          createdAt: u.createdAt,
        });
        admins++;
      }
    } catch (err) {
      console.error(`Failed to migrate user ${u.email}:`, err.message);
    }
  }

  console.log('\n✅ Migration complete:');
  console.log(`   Volunteers migrated: ${volunteers}`);
  console.log(`   Organizations migrated: ${orgs}`);
  console.log(`   Admins migrated: ${admins}`);
  console.log(`   Skipped (already exist): ${skipped}`);
  console.log('\nOld users collection is untouched. Verify data then drop it manually.');

  await mongoose.disconnect();
}

migrate().catch(err => {
  console.error('Migration failed:', err);
  process.exit(1);
});
