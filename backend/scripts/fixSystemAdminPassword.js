const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('../src/models/User');

const fixPassword = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/volunteer_app');
    console.log('Connected to MongoDB\n');

    const email = 'admin@volunteer-platform.com';
    const newPassword = 'admin123456';

    // Find user
    const user = await User.findOne({ email }).select('+password');
    
    if (!user) {
      console.log('❌ User not found');
      process.exit(1);
    }

    console.log('✅ User found:', user.email);
    
    // Reset password (let the model hash it)
    user.password = newPassword;
    await user.save();
    
    console.log('✅ Password has been reset!');
    console.log('\nYou can now login with:');
    console.log('  Email:', email);
    console.log('  Password:', newPassword);

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
};

fixPassword();
