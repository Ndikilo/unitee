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

const clearDatabase = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/volunteer_app');
    console.log('Connected to MongoDB');

    console.log('🗑️  Starting database cleanup...\n');

    // Get counts before deletion
    const beforeCounts = {
      users: await User.countDocuments(),
      communities: await Community.countDocuments(),
      opportunities: await Opportunity.countDocuments(),
      applications: await Application.countDocuments(),
      reports: await Report.countDocuments(),
      emergencyAlerts: await EmergencyAlert.countDocuments(),
      notifications: await Notification.countDocuments()
    };

    console.log('📊 Current database contents:');
    console.log(`   Users: ${beforeCounts.users}`);
    console.log(`   Communities: ${beforeCounts.communities}`);
    console.log(`   Opportunities: ${beforeCounts.opportunities}`);
    console.log(`   Applications: ${beforeCounts.applications}`);
    console.log(`   Reports: ${beforeCounts.reports}`);
    console.log(`   Emergency Alerts: ${beforeCounts.emergencyAlerts}`);
    console.log(`   Notifications: ${beforeCounts.notifications}\n`);

    // Delete all data
    console.log('🧹 Clearing all collections...');
    
    await User.deleteMany({});
    console.log('✅ Users cleared');
    
    await Community.deleteMany({});
    console.log('✅ Communities cleared');
    
    await Opportunity.deleteMany({});
    console.log('✅ Opportunities cleared');
    
    await Application.deleteMany({});
    console.log('✅ Applications cleared');
    
    await Report.deleteMany({});
    console.log('✅ Reports cleared');
    
    await EmergencyAlert.deleteMany({});
    console.log('✅ Emergency Alerts cleared');
    
    await Notification.deleteMany({});
    console.log('✅ Notifications cleared');

    // Verify deletion
    const afterCounts = {
      users: await User.countDocuments(),
      communities: await Community.countDocuments(),
      opportunities: await Opportunity.countDocuments(),
      applications: await Application.countDocuments(),
      reports: await Report.countDocuments(),
      emergencyAlerts: await EmergencyAlert.countDocuments(),
      notifications: await Notification.countDocuments()
    };

    console.log('\n📊 Database after cleanup:');
    console.log(`   Users: ${afterCounts.users}`);
    console.log(`   Communities: ${afterCounts.communities}`);
    console.log(`   Opportunities: ${afterCounts.opportunities}`);
    console.log(`   Applications: ${afterCounts.applications}`);
    console.log(`   Reports: ${afterCounts.reports}`);
    console.log(`   Emergency Alerts: ${afterCounts.emergencyAlerts}`);
    console.log(`   Notifications: ${afterCounts.notifications}`);

    const totalDeleted = Object.values(beforeCounts).reduce((sum, count) => sum + count, 0);
    const totalRemaining = Object.values(afterCounts).reduce((sum, count) => sum + count, 0);

    console.log(`\n🎉 Database cleanup completed!`);
    console.log(`📈 Total records deleted: ${totalDeleted}`);
    console.log(`📉 Total records remaining: ${totalRemaining}`);
    
    if (totalRemaining === 0) {
      console.log('✨ Database is now completely clean!');
      console.log('\n🚀 You can now create your admin account at:');
      console.log('   http://localhost:8081/admin-register');
      console.log('   Setup Key: VOLUNTEER_ADMIN_SETUP_2024');
    } else {
      console.log('⚠️  Some records may still exist. Please check manually.');
    }

  } catch (error) {
    console.error('❌ Error clearing database:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
    process.exit(0);
  }
};

// Confirmation prompt
console.log('⚠️  WARNING: This will delete ALL data from the database!');
console.log('This includes all users, communities, opportunities, applications, reports, etc.');
console.log('This action cannot be undone.\n');

// Run the script
clearDatabase();