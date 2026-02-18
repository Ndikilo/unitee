require('dotenv').config();
const mongoose = require('mongoose');
const Certificate = require('../src/models/Certificate');
const User = require('../src/models/User');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/volunteer-platform');
    console.log('MongoDB Connected');
  } catch (error) {
    console.error('Database connection failed:', error);
    process.exit(1);
  }
};

const createTestCertificate = async () => {
  try {
    await connectDB();

    // Find any user first to test connection
    const allUsers = await User.find({});
    console.log('All users found:', allUsers.length);
    
    // Find admin user
    console.log('Looking for admin user...');
    const admin = await User.findOne({ role: 'admin' });
    console.log('Admin found:', admin ? admin.email : 'None');
    if (!admin) {
      console.log('No admin user found. Please create an admin user first.');
      process.exit(1);
    }

    // Find a volunteer user (or create one)
    let volunteer = await User.findOne({ role: 'volunteer' });
    if (!volunteer) {
      volunteer = new User({
        full_name: 'Test Volunteer',
        email: 'volunteer@test.com',
        role: 'volunteer',
        password: 'password123',
        email_verified: true
      });
      await volunteer.save();
      console.log('Created test volunteer user');
    }

    // Create test certificate
    const certificateData = {
      type: 'volunteer_completion',
      title: 'Community Beach Cleanup Certificate',
      description: 'Successfully participated in the community beach cleanup initiative, contributing to environmental conservation and community wellbeing.',
      recipientId: volunteer._id,
      recipientName: volunteer.full_name,
      recipientEmail: volunteer.email,
      issuerId: admin._id,
      issuerName: admin.full_name,
      issuerType: 'admin',
      hoursCompleted: 8,
      skillsAcquired: ['Environmental Conservation', 'Community Leadership', 'Teamwork'],
      achievementLevel: 'gold',
      metadata: {
        location: 'Limbe Beach, Cameroon',
        category: 'Environmental',
        tags: ['beach cleanup', 'environment', 'community service']
      }
    };

    const certificate = await Certificate.generateCertificate(certificateData);

    console.log('\n✅ Test Certificate Created Successfully!');
    console.log('📋 Certificate Details:');
    console.log(`   ID: ${certificate.certificateId}`);
    console.log(`   Title: ${certificate.title}`);
    console.log(`   Recipient: ${certificate.recipientName}`);
    console.log(`   Issuer: ${certificate.issuerName}`);
    console.log(`   Verification URL: ${certificate.verificationUrl}`);
    console.log(`   Status: ${certificate.status}`);
    
    console.log('\n🔍 To verify this certificate:');
    console.log(`   1. Go to: http://localhost:8083/verify-certificate`);
    console.log(`   2. Enter Certificate ID: ${certificate.certificateId}`);
    console.log(`   3. Click "Verify"`);

    console.log('\n📱 You can also test the API directly:');
    console.log(`   GET /api/certificates/verify/${certificate.certificateId}`);

    process.exit(0);
  } catch (error) {
    console.error('Error creating test certificate:', error);
    process.exit(1);
  }
};

createTestCertificate();