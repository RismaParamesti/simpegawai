const mysql = require('mysql2');
const dotenv = require('dotenv');

dotenv.config();

const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

const query = `
  SELECT 
    d.id,
    d.code,
    d.name,
    d.description,
    d.status,
    d.created_at,
    d.updated_at,
    COUNT(DISTINCT e.id) as totalEmployees,
    COUNT(DISTINCT p.id) as totalPositions
  FROM departments d
  LEFT JOIN positions p ON d.id = p.department_id
  LEFT JOIN employees e ON p.id = e.position_id AND e.deleted_at IS NULL
  GROUP BY d.id, d.code, d.name, d.description, d.status, d.created_at, d.updated_at
  ORDER BY d.name ASC
`;

connection.query(query, (error, results) => {
  if (error) {
    console.error('Query error:', error);
    process.exit(1);
  }
  console.log('Query Results:');
  console.log(JSON.stringify(results, null, 2));
  connection.end();
});
