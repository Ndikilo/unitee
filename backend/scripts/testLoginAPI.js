const axios = require('axios');

const testLoginAPI = async () => {
  try {
    console.log('🧪 Testing login API...');
    
    const loginData = {
      email: 'ndakwa23@gmail.com',
      password: 'admin123456'
    };

    console.log(`📧 Email: ${loginData.email}`);
    console.log(`🔑 Password: ${loginData.password}`);
    console.log('🌐 API URL: http://localhost:5000/api/auth/login');

    const response = await axios.post('http://localhost:5000/api/auth/login', loginData, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    console.log('\n✅ Login API Response:');
    console.log('Status:', response.status);
    console.log('Data:', JSON.stringify(response.data, null, 2));

    if (response.data.token) {
      console.log('\n🎉 Login successful!');
      console.log('🔑 Token received');
      console.log('👤 User role:', response.data.role);
    }

  } catch (error) {
    console.error('\n❌ Login API Error:');
    if (error.response) {
      console.log('Status:', error.response.status);
      console.log('Data:', error.response.data);
    } else {
      console.log('Error:', error.message);
    }
  }
};

testLoginAPI();