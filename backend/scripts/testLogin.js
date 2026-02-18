const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('../src/models/User');

const testLogin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/volunteer_app');
    console.log('Connected to MongoDB');

    const email = 'ndakwa23@gmail.com'; // Your email
    console.log(`\n🔍 Testing login for: ${email}`);

    // Find the user
    const user = await User.findOne({ email }).select('+password');
    
    if (!user) {
      console.log('❌ User not found');
      return;
    }

    console.log('✅ User found:');
    console.log(`   Name: ${user.name}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Role: ${user.role}`);
    console.log(`   Password Hash: ${user.password.substring(0, 20)}...`);
    console.log(`   Is Active: ${user.isActive}`);
    console.log(`   Is Verified: ${user.isVerified}`);

    // Test password verification
    console.log('\n🔐 Testing password verification...');
    console.log('Please enter the password you used during registration:');
    
    // For testing, let's try a few common passwords
    const testPasswords = [
      'admin123456', // Default from script
      'password123',
      'admin123',
      '123456',
      'password'
    ];

    console.log('\n🧪 Testing common passwords:');
    for (const testPassword of testPasswords) {
      const isMatch = await bcrypt.compare(testPassword, user.password);
      console.log(`   "${testPassword}": ${isMatch ? '✅ MATCH' : '❌ No match'}`);
      if (isMatch) {
        console.log(`\n🎉 Password found! Use "${testPassword}" to login.`);
        break;
      }
    }

  } catch (error) {
    console.error('❌ Error testing login:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
    process.exit(0);
  }
};

testLogin();