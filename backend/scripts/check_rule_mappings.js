require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const db = require('../config/db');

async function main() {
  const [rows] = await db.promise().query(
    `SELECT wl.sp_level, COUNT(wl.id) AS cnt,
            ar.id AS rule_id, ar.rule_code, ar.rule_name
     FROM warning_letters wl
     LEFT JOIN attendance_warning_rules ar ON ar.sanction_level COLLATE utf8mb4_unicode_ci = wl.sp_level COLLATE utf8mb4_unicode_ci
     WHERE wl.generated_by = 'system'
     GROUP BY wl.sp_level, ar.id, ar.rule_code, ar.rule_name
     ORDER BY cnt DESC`);

  console.log(JSON.stringify(rows, null, 2));
  process.exit(0);
}

main().catch((e) => { console.error(e); process.exit(1); });
