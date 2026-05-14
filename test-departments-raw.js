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
      console.log('Token:', token.substring(0, 20) + '...');
      
      // Then fetch departments - get the raw response
      const req = http.request('http://localhost:5000/api/employees/departments', {
        method: 'GET',
        headers: {'Authorization': `Bearer ${token}`}
      }, (r) => {
        let out = '';
        r.on('data', c => out += c);
        r.on('end', () => {
          console.log('\n=== RAW RESPONSE ===');
          console.log(out);
          console.log('=== END RESPONSE ===');
          
          try {
            const parsed = JSON.parse(out);
            console.log('\n=== PARSED DATA (First 2 departments) ===');
            if (parsed.data && parsed.data.length > 0) {
              console.log('First department keys:', Object.keys(parsed.data[0]));
              console.log('First department data:', JSON.stringify(parsed.data[0], null, 2));
              if (parsed.data.length > 1) {
                console.log('Second department data:', JSON.stringify(parsed.data[1], null, 2));
              }
            }
          } catch (e) {
            console.error('Parse error:', e.message);
          }
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
