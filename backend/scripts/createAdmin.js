const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Import User model
const User = require('../src/models/User');

const createAdmin = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/volunteer_app');
    console.log('Connected to MongoDB');

    // Admin user details
    const adminData = {
      name: 'System Administrator',
      email: 'admin@volunteer-platform.com',
      password: 'admin123456', // Change this to a secure password
      role: 'admin',
      isVerified: true,
      emailVerified: true,
      isActive: true
    };

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: adminData.email });
    if (existingAdmin) {
      console.log('❌ Admin user already exists with email:', adminData.email);
      console.log('Admin ID:', existingAdmin._id);
      process.exit(0);
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    adminData.password = await bcrypt.hash(adminData.password, salt);

    // Create admin user
    const admin = await User.create(adminData);
    
    console.log('✅ Admin user created successfully!');
    console.log('📧 Email:', admin.email);
    console.log('🔑 Password: admin123456 (CHANGE THIS IMMEDIATELY!)');
    console.log('👤 Name:', admin.name);
    console.log('🆔 User ID:', admin._id);
    console.log('🔐 Role:', admin.role);
    
    console.log('\n🚀 You can now login at: http://localhost:8081/login');
    console.log('⚠️  IMPORTANT: Change the default password after first login!');

  } catch (error) {
    console.error('❌ Error creating admin user:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
    process.exit(0);
  }
};

// Run the script
createAdmin();