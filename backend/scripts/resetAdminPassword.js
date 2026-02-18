const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('../src/models/User');

const resetAdminPassword = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/volunteer_app');
    console.log('Connected to MongoDB');

    const email = 'ndakwa23@gmail.com'; // Your email
    const newPassword = '#1masterDqUNITEE'; // Your simplified password

    console.log(`\n🔄 Resetting password for: ${email}`);
    console.log(`🔑 New password will be: ${newPassword}`);

    // Find the user
    const user = await User.findOne({ email });
    
    if (!user) {
      console.log('❌ User not found');
      return;
    }

    console.log('✅ User found, updating password...');

    // Hash the new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update the user's password
    await User.findByIdAndUpdate(user._id, { 
      password: hashedPassword 
    });

    console.log('✅ Password updated successfully!');
    console.log('\n🎉 You can now login with:');
    console.log(`   📧 Email: ${email}`);
    console.log(`   🔑 Password: ${newPassword}`);
    console.log('\n🚀 Login URL: http://localhost:8081/login');

    // Verify the password works
    const updatedUser = await User.findOne({ email }).select('+password');
    const isMatch = await bcrypt.compare(newPassword, updatedUser.password);
    
    if (isMatch) {
      console.log('✅ Password verification successful!');
    } else {
      console.log('❌ Password verification failed!');
    }

  } catch (error) {
    console.error('❌ Error resetting password:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
    process.exit(0);
  }
};

resetAdminPassword();