const http = require('http');

// Simple test to call departments endpoint
const testDepartmentsEndpoint = async () => {
  try {
    // First login to get token
    const loginData = JSON.stringify({
      email: 'user6@gmail.com',
      password: 'user6'
    });
    
    console.log('Logging in...');
    const loginResponse = await new Promise((resolve, reject) => {
      const req = http.request('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(loginData)
        }
      }, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => resolve({ status: res.statusCode, data: JSON.parse(data) }));
      });
      req.on('error', reject);
      req.write(loginData);
      req.end();
    });
    
    if (loginResponse.status !== 200) {
      throw new Error(`Login failed: ${loginResponse.data.message}`);
    }
    
    const token = loginResponse.data.token;
    console.log('Token obtained:', token.substring(0, 20) + '...');
    
    // Now test departments endpoint
    console.log('Calling /api/employees/departments...');
    const depResponse = await new Promise((resolve, reject) => {
      const req = http.request('http://localhost:5000/api/employees/departments', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => resolve({ status: res.statusCode, data: JSON.parse(data) }));
      });
      req.on('error', reject);
      req.end();
    });
    
    console.log('Status:', depResponse.status);
    console.log('Response:', JSON.stringify(depResponse.data, null, 2));
  } catch (error) {
    console.error('Error:', error.message);
  }
};

testDepartmentsEndpoint();
