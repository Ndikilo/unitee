const axios = require('axios');

const API_BASE = 'http://localhost:5000/api';

async function testRegistration() {
  try {
    console.log('🧪 Testing User Registration\n');

    // Test data
    const testUser = {
      name: 'Test Volunteer',
      email: 'testvolunteer@example.com',
      password: 'Test@123456',
      role: 'user'
    };

    console.log('📤 Sending registration request...');
    console.log('Data:', JSON.stringify(testUser, null, 2));
    console.log('');

    const response = await axios.post(`${API_BASE}/auth/register`, testUser);

    console.log('✅ Registration successful!');
    console.log('Response:', JSON.stringify(response.data, null, 2));
    console.log('');
    console.log('User created:');
    console.log(`  Name: ${response.data.name}`);
    console.log(`  Email: ${response.data.email}`);
    console.log(`  Role: ${response.data.role}`);
    console.log(`  Token: ${response.data.token ? 'Generated' : 'Missing'}`);

  } catch (error) {
    console.error('❌ Registration failed!');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Error:', error.response.data);
    } else if (error.request) {
      console.error('No response received from server');
      console.error('Request was made but no response');
    } else {
      console.error('Error:', error.message);
    }
  }
}

testRegistration();
