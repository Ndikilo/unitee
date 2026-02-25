const mongoose = require('mongoose');
require('dotenv').config({ path: './backend/.env' });

const User = require('../src/models/User');

async function testCompleteAdminFlow() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // 1. Find admin user
    const admin = await User.findOne({ email: 'admin@unitee.cm' }).select('+password');
    
    if (!admin) {
      console.log('❌ Admin user not found!');
      process.exit(1);
    }

    console.log('📋 ADMIN USER DETAILS:');
    console.log('  ID:', admin._id);
    console.log('  Name:', admin.name);
    console.log('  Email:', admin.email);
    console.log('  Role:', admin.role);
    console.log('  Active:', admin.isActive);
    console.log('  Email Verified:', admin.emailVerified);
    console.log('  Created:', admin.createdAt);
    console.log('');

    // 2. Test password
    const testPassword = 'Admin@2024';
    const isMatch = await admin.matchPassword(testPassword);
    
    console.log('🔐 PASSWORD TEST:');
    console.log('  Test Password:', testPassword);
    console.log('  Match Result:', isMatch ? '✅ VALID' : '❌ INVALID');
    console.log('');

    // 3. Simulate login response
    if (isMatch) {
      const jwt = require('jsonwebtoken');
      const token = jwt.sign(
        { id: admin._id },
        process.env.JWT_SECRET,
        { expiresIn: '30d' }
      );

      const loginResponse = {
        _id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
        isVerified: admin.isVerified,
        emailVerified: admin.emailVerified,
        profile: admin.profile,
        organizationName: admin.organizationName,
        token: token
      };

      console.log('📤 LOGIN RESPONSE (what frontend receives):');
      console.log(JSON.stringify(loginResponse, null, 2));
      console.log('');

      console.log('✅ ADMIN LOGIN FLOW TEST PASSED!');
      console.log('');
      console.log('🎯 EXPECTED BEHAVIOR:');
      console.log('  1. User logs in with admin@unitee.cm / Admin@2024');
      console.log('  2. Backend returns user data with role="admin"');
      console.log('  3. Frontend stores token and user in localStorage');
      console.log('  4. Frontend redirects to /admin-dashboard');
      console.log('  5. Admin dashboard loads with full CRUD controls');
    } else {
      console.log('❌ PASSWORD MISMATCH - Login would fail!');
    }

    await mongoose.connection.close();
    console.log('\n✅ Test completed');
    process.exit(0);

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

testCompleteAdminFlow();
