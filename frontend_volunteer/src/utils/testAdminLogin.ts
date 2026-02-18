// Utility to test admin login from browser console
export const testAdminLogin = async () => {
  const API_BASE_URL = 'http://localhost:5000/api';
  
  const loginData = {
    email: 'ndakwa23@gmail.com',
    password: '#1masterDqUNITEE'
  };

  try {
    console.log('🧪 Testing admin login...');
    console.log('📧 Email:', loginData.email);
    console.log('🔑 Password:', loginData.password);

    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(loginData),
    });

    if (response.ok) {
      const data = await response.json();
      console.log('✅ Login successful!');
      console.log('👤 User:', data.name);
      console.log('🎭 Role:', data.role);
      console.log('🔑 Token:', data.token ? 'Generated' : 'Missing');
      
      // Store token for testing
      if (data.token) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data));
        console.log('💾 Token stored in localStorage');
      }
      
      return data;
    } else {
      const error = await response.json();
      console.error('❌ Login failed:', error.message);
      return null;
    }
  } catch (error) {
    console.error('❌ Network error:', error);
    return null;
  }
};

// Make it available globally for testing
if (typeof window !== 'undefined') {
  (window as any).testAdminLogin = testAdminLogin;
}