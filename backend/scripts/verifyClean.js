const mongoose = require('mongoose');
require('dotenv').config();

// Import all models
const User = require('../src/models/User');
const Community = require('../src/models/Community');
const Opportunity = require('../src/models/Opportunity');
const Application = require('../src/models/Application');
const Report = require('../src/models/Report');
const EmergencyAlert = require('../src/models/EmergencyAlert');
const Notification = require('../src/models/Notification');

const verifyClean = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/volunteer_app');
    console.log('Connected to MongoDB');

    console.log('🔍 Verifying database is clean...\n');

    // Check all collections
    const counts = {
      users: await User.countDocuments(),
      communities: await Community.countDocuments(),
      opportunities: await Opportunity.countDocuments(),
      applications: await Application.countDocuments(),
      reports: await Report.countDocuments(),
      emergencyAlerts: await EmergencyAlert.countDocuments(),
      notifications: await Notification.countDocuments()
    };

    console.log('📊 Current database state:');
    Object.entries(counts).forEach(([collection, count]) => {
      const status = count === 0 ? '✅' : '❌';
      console.log(`   ${status} ${collection}: ${count}`);
    });

    const totalRecords = Object.values(counts).reduce((sum, count) => sum + count, 0);
    
    console.log(`\n📈 Total records: ${totalRecords}`);
    
    if (totalRecords === 0) {
      console.log('🎉 Database is completely clean!');
      console.log('✅ Ready for fresh admin account creation');
    } else {
      console.log('⚠️  Database still contains data');
    }

  } catch (error) {
    console.error('❌ Error verifying database:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
    process.exit(0);
  }
};

verifyClean();