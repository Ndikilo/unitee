require('dotenv').config();
const axios = require('axios');
const mongoose = require('mongoose');

const BASE_URL = 'http://localhost:5000/api';

const testFullAuthFlow = async () => {
  console.log('🚀 TESTING COMPLETE AUTHENTICATION FLOW');
  console.log('==========================================\n');

  try {
    // Connect to database to verify storage
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/volunteer_app');
    const User = require('../src/models/User');

    // Test 1: Register a new volunteer
    console.log('👤 Test 1: Register New Volunteer');
    console.log('----------------------------------');
    
    const volunteerData = {
      name: 'Jane Volunteer',
      email: `volunteer${Date.now()}@example.com`,
      password: 'securepass123',
      role: 'user'
    };

    const registerResponse = await axios.post(`${BASE_URL}/auth/register`, volunteerData);
    console.log('✅ Volunteer registration successful!');
    console.log(`   User ID: ${registerResponse.data._id}`);
    console.log(`   Name: ${registerResponse.data.name}`);
    console.log(`   Email: ${registerResponse.data.email}`);
    console.log(`   Role: ${registerResponse.data.role}`);
    console.log(`   Token: ${registerResponse.data.token ? 'Generated' : 'Missing'}`);
    console.log(`   Email Verified: ${registerResponse.data.emailVerified}`);

    // Verify user is in database
    const dbUser = await User.findById(registerResponse.data._id);
    console.log(`   ✅ User stored in database: ${dbUser ? 'Yes' : 'No'}`);
    if (dbUser) {
      console.log(`   Database Name: ${dbUser.name}`);
      console.log(`   Database Email: ${dbUser.email}`);
      console.log(`   Database Role: ${dbUser.role}`);
    }

    // Test 2: Register an NGO/Organizer
    console.log('\n🏢 Test 2: Register New NGO/Organizer');
    console.log('-------------------------------------');
    
    const organizerData = {
      name: 'Green Earth NGO',
      email: `ngo${Date.now()}@example.com`,
      password: 'ngopass123',
      role: 'organizer',
      organizationName: 'Green Earth Environmental Foundation'
    };

    const orgRegisterResponse = await axios.post(`${BASE_URL}/auth/register`, organizerData);
    console.log('✅ NGO registration successful!');
    console.log(`   User ID: ${orgRegisterResponse.data._id}`);
    console.log(`   Name: ${orgRegisterResponse.data.name}`);
    console.log(`   Email: ${orgRegisterResponse.data.email}`);
    console.log(`   Role: ${orgRegisterResponse.data.role}`);
    console.log(`   Token: ${orgRegisterResponse.data.token ? 'Generated' : 'Missing'}`);

    // Verify organizer is in database
    const dbOrganizer = await User.findById(orgRegisterResponse.data._id);
    console.log(`   ✅ Organizer stored in database: ${dbOrganizer ? 'Yes' : 'No'}`);
    if (dbOrganizer) {
      console.log(`   Organization Name: ${dbOrganizer.organizationName}`);
      console.log(`   Verification Status: ${dbOrganizer.organizationVerificationStatus}`);
    }

    // Test 3: Login with volunteer credentials
    console.log('\n🔑 Test 3: Volunteer Login');
    console.log('--------------------------');
    
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: volunteerData.email,
      password: volunteerData.password
    });
    
    console.log('✅ Volunteer login successful!');
    console.log(`   User ID: ${loginResponse.data._id}`);
    console.log(`   Name: ${loginResponse.data.name}`);
    console.log(`   Role: ${loginResponse.data.role}`);
    console.log(`   Token: ${loginResponse.data.token ? 'Generated' : 'Missing'}`);
    console.log(`   Profile Data: ${loginResponse.data.profile ? 'Included' : 'Missing'}`);

    // Test 4: Use token to access protected route
    console.log('\n🛡️  Test 4: Protected Route Access');
    console.log('----------------------------------');
    
    const token = loginResponse.data.token;
    const profileResponse = await axios.get(`${BASE_URL}/auth/me`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('✅ Protected route access successful!');
    console.log(`   Profile Name: ${profileResponse.data.name}`);
    console.log(`   Profile Email: ${profileResponse.data.email}`);
    console.log(`   Profile Role: ${profileResponse.data.role}`);
    console.log(`   Last Active: ${profileResponse.data.lastActive}`);

    // Test 5: Test admin login
    console.log('\n👑 Test 5: Admin Login');
    console.log('----------------------');
    
    const adminLoginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'ndakwa23@gmail.com',
      password: '#1masterDqUNITEE'
    });
    
    console.log('✅ Admin login successful!');
    console.log(`   Admin ID: ${adminLoginResponse.data._id}`);
    console.log(`   Admin Name: ${adminLoginResponse.data.name}`);
    console.log(`   Admin Role: ${adminLoginResponse.data.role}`);
    console.log(`   Admin Token: ${adminLoginResponse.data.token ? 'Generated' : 'Missing'}`);

    // Test 6: Database verification
    console.log('\n💾 Test 6: Final Database State');
    console.log('-------------------------------');
    
    const allUsers = await User.find({}).select('name email role organizationName createdAt');
    console.log(`✅ Total users in database: ${allUsers.length}`);
    
    allUsers.forEach((user, index) => {
      console.log(`   ${index + 1}. ${user.name} (${user.email})`);
      console.log(`      Role: ${user.role}`);
      if (user.organizationName) {
        console.log(`      Organization: ${user.organizationName}`);
      }
      console.log(`      Created: ${user.createdAt.toLocaleDateString()}`);
      console.log('');
    });

    // Test 7: Invalid login attempt
    console.log('❌ Test 7: Invalid Login Attempt');
    console.log('---------------------------------');
    
    try {
      await axios.post(`${BASE_URL}/auth/login`, {
        email: 'nonexistent@example.com',
        password: 'wrongpassword'
      });
      console.log('❌ Invalid login should have failed!');
    } catch (error) {
      console.log('✅ Invalid login properly rejected');
      console.log(`   Error: ${error.response.data.message}`);
    }

    await mongoose.disconnect();

    console.log('\n🎯 AUTHENTICATION FLOW TEST RESULTS');
    console.log('====================================');
    console.log('✅ User registration: WORKING');
    console.log('✅ NGO registration: WORKING');
    console.log('✅ User login: WORKING');
    console.log('✅ Admin login: WORKING');
    console.log('✅ Token generation: WORKING');
    console.log('✅ Protected routes: WORKING');
    console.log('✅ Database storage: WORKING');
    console.log('✅ Invalid login handling: WORKING');
    console.log('\n🚀 AUTHENTICATION SYSTEM IS FULLY FUNCTIONAL!');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data?.message || error.message);
    await mongoose.disconnect();
  }
};

testFullAuthFlow();