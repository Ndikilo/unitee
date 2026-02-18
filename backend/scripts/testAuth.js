require('dotenv').config();
const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

const testAuth = async () => {
  console.log('🔐 TESTING AUTHENTICATION SYSTEM');
  console.log('=====================================\n');

  try {
    // Test 1: Register a new user
    console.log('📝 Test 1: User Registration');
    console.log('-----------------------------');
    
    const testUser = {
      name: 'Test Volunteer',
      email: `test${Date.now()}@example.com`,
      password: 'password123',
      role: 'user' // Changed from 'volunteer' to 'user'
    };

    try {
      const registerResponse = await axios.post(`${BASE_URL}/auth/register`, testUser);
      console.log('✅ Registration successful!');
      console.log(`   User ID: ${registerResponse.data._id}`);
      console.log(`   Name: ${registerResponse.data.name}`);
      console.log(`   Email: ${registerResponse.data.email}`);
      console.log(`   Role: ${registerResponse.data.role}`);
      console.log(`   Token received: ${registerResponse.data.token ? 'Yes' : 'No'}`);
      
      // Test 2: Login with the new user
      console.log('\n🔑 Test 2: User Login');
      console.log('--------------------');
      
      const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
        email: testUser.email,
        password: testUser.password
      });
      
      console.log('✅ Login successful!');
      console.log(`   User ID: ${loginResponse.data._id}`);
      console.log(`   Name: ${loginResponse.data.name}`);
      console.log(`   Email: ${loginResponse.data.email}`);
      console.log(`   Role: ${loginResponse.data.role}`);
      console.log(`   Token received: ${loginResponse.data.token ? 'Yes' : 'No'}`);
      
      const token = loginResponse.data.token;
      
      // Test 3: Get user profile with token
      console.log('\n👤 Test 3: Get User Profile');
      console.log('---------------------------');
      
      const profileResponse = await axios.get(`${BASE_URL}/auth/me`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log('✅ Profile fetch successful!');
      console.log(`   User ID: ${profileResponse.data._id}`);
      console.log(`   Name: ${profileResponse.data.name}`);
      console.log(`   Email: ${profileResponse.data.email}`);
      console.log(`   Role: ${profileResponse.data.role}`);
      console.log(`   Created: ${profileResponse.data.createdAt}`);
      
      // Test 4: Test admin login
      console.log('\n👑 Test 4: Admin Login');
      console.log('---------------------');
      
      const adminLoginResponse = await axios.post(`${BASE_URL}/auth/login`, {
        email: 'ndakwa23@gmail.com',
        password: '#1masterDqUNITEE'
      });
      
      console.log('✅ Admin login successful!');
      console.log(`   User ID: ${adminLoginResponse.data._id}`);
      console.log(`   Name: ${adminLoginResponse.data.name}`);
      console.log(`   Email: ${adminLoginResponse.data.email}`);
      console.log(`   Role: ${adminLoginResponse.data.role}`);
      console.log(`   Token received: ${adminLoginResponse.data.token ? 'Yes' : 'No'}`);
      
    } catch (error) {
      if (error.response) {
        console.log(`❌ Error: ${error.response.data.message}`);
        console.log(`   Status: ${error.response.status}`);
      } else {
        console.log(`❌ Network Error: ${error.message}`);
      }
    }

    // Test 5: Check database storage
    console.log('\n💾 Test 5: Database Storage Verification');
    console.log('---------------------------------------');
    
    const mongoose = require('mongoose');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/volunteer_app');
    
    const User = require('../src/models/User');
    const users = await User.find({}).select('name email role createdAt');
    
    console.log(`✅ Database contains ${users.length} users:`);
    users.forEach((user, index) => {
      console.log(`   ${index + 1}. ${user.name} (${user.email}) - ${user.role} - ${user.createdAt.toLocaleDateString()}`);
    });
    
    await mongoose.disconnect();

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }

  console.log('\n🎯 AUTHENTICATION TEST COMPLETE');
  console.log('=====================================');
};

testAuth();