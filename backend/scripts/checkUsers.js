const mongoose = require('mongoose');
require('dotenv').config();

const User = require('../src/models/User');

const checkUsers = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/volunteer_app');
    console.log('Connected to MongoDB');

    const users = await User.find({}).select('email role name _id createdAt');
    
    console.log('\n👥 All users in database:');
    console.log('='.repeat(50));
    
    if (users.length === 0) {
      console.log('❌ No users found in database');
      console.log('\n💡 This means your admin account was not created successfully.');
      console.log('   Please try the admin registration again.');
    } else {
      users.forEach((user, index) => {
        console.log(`${index + 1}. Email: ${user.email}`);
        console.log(`   Role: ${user.role}`);
        console.log(`   Name: ${user.name}`);
        console.log(`   ID: ${user._id}`);
        console.log(`   Created: ${user.createdAt}`);
        console.log('');
      });
      
      const adminUsers = users.filter(user => user.role === 'admin');
      console.log(`📊 Total users: ${users.length}`);
      console.log(`👑 Admin users: ${adminUsers.length}`);
      
      if (adminUsers.length > 0) {
        console.log('\n✅ Admin account(s) found:');
        adminUsers.forEach(admin => {
          console.log(`   📧 ${admin.email} (${admin.name})`);
        });
      }
    }

  } catch (error) {
    console.error('❌ Error checking users:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
    process.exit(0);
  }
};

checkUsers();