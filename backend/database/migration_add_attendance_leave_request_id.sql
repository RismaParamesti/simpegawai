-- Migration: add leave_request_id to attendance so attendance rows can reference originating leave_requests
-- Run this against the database to add the column and optional FK

ALTER TABLE attendance
  ADD COLUMN leave_request_id INT NULL AFTER notes;

-- Add index for faster lookups
ALTER TABLE attendance
  ADD INDEX idx_attendance_leave_request_id (leave_request_id);

-- Optional: add foreign key constraint (uncomment if your DB allows and you want FK enforcement)
-- ALTER TABLE attendance
--   ADD CONSTRAINT fk_attendance_leave_request
--   FOREIGN KEY (leave_request_id) REFERENCES leave_requests(id)
--   ON DELETE SET NULL ON UPDATE CASCADE;
