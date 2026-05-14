const db = require('./config/db');

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

db.promise().query(query).then(([results]) => {
  console.log('Results:');
  console.log(JSON.stringify(results.slice(0, 3), null, 2));
  process.exit(0);
}).catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
