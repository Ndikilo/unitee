const http = require('http');

const testLoginEndpoint = async () => {
  const loginData = JSON.stringify({
    email: 'ndakwa23@gmail.com',
    password: '#1masterDqUNITEE'
  });

  const options = {
    hostname: 'localhost',
    port: 5000,
    path: '/api/auth/login',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(loginData)
    }
  };

  console.log('🧪 Testing login endpoint with your password...');
  console.log(`📧 Email: ndakwa23@gmail.com`);
  console.log(`🔑 Password: #1masterDqUNITEE`);

  const req = http.request(options, (res) => {
    let data = '';

    res.on('data', (chunk) => {
      data += chunk;
    });

    res.on('end', () => {
      console.log(`\n📊 Response Status: ${res.statusCode}`);
      
      if (res.statusCode === 200) {
        const response = JSON.parse(data);
        console.log('✅ Login successful!');
        console.log(`👤 User: ${response.name}`);
        console.log(`🎭 Role: ${response.role}`);
        console.log(`🔑 Token: ${response.token ? 'Generated' : 'Missing'}`);
        console.log('\n🎉 Your password works perfectly!');
      } else {
        console.log('❌ Login failed');
        console.log('Response:', data);
      }
    });
  });

  req.on('error', (error) => {
    console.error('❌ Request error:', error.message);
  });

  req.write(loginData);
  req.end();
};

testLoginEndpoint();