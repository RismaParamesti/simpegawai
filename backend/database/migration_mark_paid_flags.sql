-- Mark common paid leave types in leave_request_settings by setting meta.paid = 1
-- Run after migration_leave_request_policies.sql which creates the table

UPDATE leave_request_settings
SET meta = JSON_SET(COALESCE(meta, '{}'), '$.paid', 1)
WHERE leave_type IN (
  'cuti_tahunan',
  'cuti_sakit',
  'cuti_melahirkan',
  'cuti_keguguran',
  'cuti_menikah',
  'cuti_khusus',
  'cuti_besar'
);
