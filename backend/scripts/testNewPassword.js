const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('../src/models/User');

const testNewPassword = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/volunteer_app');
    console.log('Connected to MongoDB');

    const email = 'ndakwa23@gmail.com';
    const testPassword = '#1masterDqUNITEE';

    console.log(`\n🔍 Testing login for: ${email}`);
    console.log(`🔑 Testing password: ${testPassword}`);

    // Find the user
    const user = await User.findOne({ email }).select('+password');
    
    if (!user) {
      console.log('❌ User not found');
      return;
    }

    console.log('✅ User found');

    // Test password verification
    const isMatch = await bcrypt.compare(testPassword, user.password);
    
    if (isMatch) {
      console.log('✅ Password verification successful!');
      console.log('\n🎉 Your login credentials are:');
      console.log(`   📧 Email: ${email}`);
      console.log(`   🔑 Password: ${testPassword}`);
      console.log('\n🚀 You can now login at: http://localhost:8081/login');
    } else {
      console.log('❌ Password verification failed!');
      console.log('The password in the database does not match the test password.');
    }

  } catch (error) {
    console.error('❌ Error testing password:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
    process.exit(0);
  }
};

testNewPassword();