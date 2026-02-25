const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('../src/models/User');

const testLogin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/volunteer_app');
    console.log('Connected to MongoDB\n');

    const email = 'admin@unitee.cm';
    const password = 'Admin@2024';

    // Find user
    const user = await User.findOne({ email }).select('+password');
    
    if (!user) {
      console.log('❌ User not found');
      process.exit(1);
    }

    console.log('✅ User found:', user.email);
    console.log('Stored password hash:', user.password.substring(0, 20) + '...');
    
    // Test password match
    const isMatch = await user.matchPassword(password);
    console.log('\n🔐 Password match result:', isMatch);
    
    if (isMatch) {
      console.log('✅ Login would succeed!');
    } else {
      console.log('❌ Login would fail - password does not match');
      console.log('\n🔧 Fixing password...');
      
      // Reset password correctly (let the model hash it)
      user.password = password;
      await user.save();
      
      console.log('✅ Password has been reset!');
      console.log('You can now login with:');
      console.log('  Email:', email);
      console.log('  Password:', password);
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
};

testLogin();
