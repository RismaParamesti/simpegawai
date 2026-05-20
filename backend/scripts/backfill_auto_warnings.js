// Load backend .env explicitly so DB credentials are available when running script from project root
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const db = require('../config/db');
const attendanceCtrl = require('../controllers/attendance');

async function main() {
  console.log('Backfill: find system-generated warning_letters with missing rule metadata');

  const [rows] = await db.promise().query(
    `SELECT DISTINCT employee_id
     FROM warning_letters
     WHERE generated_by = 'system' AND (rule_id IS NULL OR rule_code IS NULL)
     ORDER BY employee_id`);

  console.log(`Found ${rows.length} employees to re-evaluate`);
  for (const r of rows) {
    try {
      console.log(`Re-evaluating employee ${r.employee_id} ...`);
      await attendanceCtrl.evaluateAlphaDisciplineForEmployee(r.employee_id);
      console.log(`  done for ${r.employee_id}`);
    } catch (e) {
      console.error(`  failed for ${r.employee_id}:`, e.message || e);
    }
  }

  console.log('Backfill finished');
  process.exit(0);
}

main().catch((e) => {
  console.error('Backfill script error:', e);
  process.exit(1);
});
