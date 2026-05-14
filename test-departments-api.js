const http = require('http');

// First login
const loginData = JSON.stringify({email:'user6@gmail.com', password:'user6'});
const loginReq = http.request('http://localhost:5000/api/auth/login', {
  method: 'POST',
  headers: {'Content-Type': 'application/json'}
}, (res) => {
  let data = '';
  res.on('data', c => data += c);
  res.on('end', () => {
    try {
      const token = JSON.parse(data).token;
      console.log('✅ Login successful, token:', token.substring(0, 20) + '...');
      
      // Then fetch departments
      const req = http.request('http://localhost:5000/api/employees/departments', {
        method: 'GET',
        headers: {'Authorization': `Bearer ${token}`}
      }, (r) => {
        let out = '';
        r.on('data', c => out += c);
        r.on('end', () => {
          const result = JSON.parse(out);
          console.log('\n📊 Departments Data:');
          console.log(JSON.stringify(result, null, 2));
        });
      });
      req.on('error', (e) => console.error('Request error:', e));
      req.end();
    } catch (e) {
      console.error('Error:', e.message);
    }
  });
});

loginReq.write(loginData);
loginReq.on('error', (e) => console.error('Login error:', e));
loginReq.end();
