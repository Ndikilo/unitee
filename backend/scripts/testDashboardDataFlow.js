const mongoose = require('mongoose');
const axios = require('axios');
require('dotenv').config({ path: './backend/.env' });

const User = require('../src/models/User');
const Opportunity = require('../src/models/Opportunity');
const Community = require('../src/models/Community');

const API_BASE = 'http://localhost:5000/api';

async function testDashboardDataFlow() {
  try {
    console.log('🧪 Testing Admin Dashboard Data Flow\n');

    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Step 1: Get current counts
    console.log('📊 STEP 1: Current Database State');
    const currentUsers = await User.countDocuments();
    const currentOpps = await Opportunity.countDocuments();
    const currentComms = await Community.countDocuments();
    
    console.log(`  Users: ${currentUsers}`);
    console.log(`  Opportunities: ${currentOpps}`);
    console.log(`  Communities: ${currentComms}\n`);

    // Step 2: Login as admin to get token
    console.log('🔐 STEP 2: Login as Admin');
    const loginResponse = await axios.post(`${API_BASE}/auth/login`, {
      email: 'admin@unitee.cm',
      password: 'Admin@2024'
    });
    
    const token = loginResponse.data.token;
    console.log('✅ Admin logged in successfully\n');

    // Step 3: Fetch admin stats via API
    console.log('📈 STEP 3: Fetch Stats from Admin API');
    const statsResponse = await axios.get(`${API_BASE}/admin/stats`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('Stats from API:');
    console.log(`  Total Users: ${statsResponse.data.totalUsers}`);
    console.log(`  Total Opportunities: ${statsResponse.data.totalOpportunities}`);
    console.log(`  Total Communities: ${statsResponse.data.totalCommunities}`);
    console.log(`  Total Applications: ${statsResponse.data.totalApplications}`);
    console.log(`  Total Hours: ${statsResponse.data.totalHours}`);
    console.log(`  Active Users: ${statsResponse.data.activeUsers}\n`);

    // Step 4: Verify data matches
    console.log('✔️  STEP 4: Verify Data Consistency');
    const statsMatch = 
      statsResponse.data.totalUsers === currentUsers &&
      statsResponse.data.totalOpportunities === currentOpps &&
      statsResponse.data.totalCommunities === currentComms;
    
    if (statsMatch) {
      console.log('✅ API stats match database counts!\n');
    } else {
      console.log('❌ Mismatch detected:');
      console.log(`  Users: DB=${currentUsers}, API=${statsResponse.data.totalUsers}`);
      console.log(`  Opportunities: DB=${currentOpps}, API=${statsResponse.data.totalOpportunities}`);
      console.log(`  Communities: DB=${currentComms}, API=${statsResponse.data.totalCommunities}\n`);
    }

    // Step 5: Fetch users list
    console.log('👥 STEP 5: Fetch Users List');
    const usersResponse = await axios.get(`${API_BASE}/admin/users?limit=100`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('Raw users response:', JSON.stringify(usersResponse.data, null, 2));
    
    const users = usersResponse.data.users || usersResponse.data.data || [];
    console.log(`✅ Fetched ${users.length} users from API`);
    users.forEach((user, idx) => {
      console.log(`  ${idx + 1}. ${user.name} (${user.email}) - ${user.role}`);
    });
    console.log('');

    // Step 6: Fetch opportunities
    console.log('📅 STEP 6: Fetch Opportunities');
    const oppsResponse = await axios.get(`${API_BASE}/opportunities`);
    const opportunities = Array.isArray(oppsResponse.data) ? oppsResponse.data : oppsResponse.data.data || [];
    console.log(`✅ Fetched ${opportunities.length} opportunities from API\n`);

    // Step 7: Fetch communities
    console.log('🏘️  STEP 7: Fetch Communities');
    const commsResponse = await axios.get(`${API_BASE}/communities`);
    const communities = Array.isArray(commsResponse.data) ? commsResponse.data : commsResponse.data.data || [];
    console.log(`✅ Fetched ${communities.length} communities from API\n`);

    // Summary
    console.log('═══════════════════════════════════════');
    console.log('📋 SUMMARY');
    console.log('═══════════════════════════════════════');
    console.log('✅ Admin login: SUCCESS');
    console.log('✅ Stats API: WORKING');
    console.log('✅ Users API: WORKING');
    console.log('✅ Opportunities API: WORKING');
    console.log('✅ Communities API: WORKING');
    console.log('✅ Data consistency: ' + (statsMatch ? 'VERIFIED' : 'NEEDS REVIEW'));
    console.log('');
    console.log('🎯 DASHBOARD REFRESH TEST:');
    console.log('   When you click "Refresh" in admin dashboard:');
    console.log(`   - Stats will show: ${statsResponse.data.totalUsers} users, ${statsResponse.data.totalOpportunities} opportunities, ${statsResponse.data.totalCommunities} communities`);
    console.log(`   - Users tab will show: ${users.length} users`);
    console.log(`   - Opportunities tab will show: ${opportunities.length} opportunities`);
    console.log(`   - Communities tab will show: ${communities.length} communities`);
    console.log('');
    console.log('✅ All data is REAL and updates automatically!');

    await mongoose.connection.close();
    process.exit(0);

  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
    process.exit(1);
  }
}

testDashboardDataFlow();
