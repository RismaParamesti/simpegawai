require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const db = require('../config/db');

async function main() {
  const [result] = await db.promise().query(
    `UPDATE warning_letters wl
     JOIN attendance_warning_rules ar ON ar.sanction_level COLLATE utf8mb4_unicode_ci = wl.sp_level COLLATE utf8mb4_unicode_ci
     SET wl.rule_id = ar.id,
         wl.rule_code = ar.rule_code
     WHERE wl.generated_by = 'system' AND (wl.rule_id IS NULL OR wl.rule_code IS NULL)`);

  console.log('Updated rows:', result.affectedRows);
  process.exit(0);
}

main().catch((e) => { console.error(e); process.exit(1); });
