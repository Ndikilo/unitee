const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Import User model
const User = require('../src/models/User');

const createCustomAdmin = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/volunteer_app');
    console.log('Connected to MongoDB');

    // Custom admin user details
    const adminData = {
      name: 'UNITEE Administrator',
      email: 'admin@unitee.cm',
      password: 'Admin@2024',
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
      await mongoose.disconnect();
      process.exit(0);
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    adminData.password = await bcrypt.hash(adminData.password, salt);

    // Create admin user
    const admin = await User.create(adminData);
    
    console.log('✅ Admin user created successfully!');
    console.log('📧 Email:', admin.email);
    console.log('🔑 Password: Admin@2024');
    console.log('👤 Name:', admin.name);
    console.log('🆔 User ID:', admin._id);
    console.log('🔐 Role:', admin.role);
    
    console.log('\n🚀 You can now login at: http://localhost:8082/login');

  } catch (error) {
    console.error('❌ Error creating admin user:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
    process.exit(0);
  }
};

// Run the script
createCustomAdmin();
