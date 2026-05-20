require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const db = require('../config/db');

async function main() {
  const [rows] = await db.promise().query(
    `SELECT id, auto_letter_number, employee_id, rule_id, rule_code, sp_level, violation_date, issued_date, evidence_snapshot, created_at
     FROM warning_letters
     WHERE generated_by = 'system' AND (rule_id IS NULL OR rule_code IS NULL)
     ORDER BY created_at DESC
     LIMIT 200`);

  console.log(JSON.stringify(rows, null, 2));
  process.exit(0);
}

main().catch((e) => { console.error(e); process.exit(1); });
