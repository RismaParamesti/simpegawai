const mysql = require('mysql2');

const conn = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'pegawai2'
});

conn.query("SELECT u.id, u.email, u.name, r.name as role FROM users u LEFT JOIN user_roles ur ON u.id = ur.user_id LEFT JOIN roles r ON ur.role_id = r.id WHERE u.email='user6@gmail.com'", (err, res) => {
  if (err) {
    console.error('Error:', err);
  } else {
    console.log('User6 Info:', JSON.stringify(res, null, 2));
  }
  conn.end();
  process.exit(0);
});
