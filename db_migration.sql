-- PART 1: Database Migration Script (Remaining Steps)

USE unilearn_db;

-- 4. Drop the examiners table (now that all references are removed)
DROP TABLE IF EXISTS examiners;

-- 5. Update the users role CHECK constraint to drop 'examiner'
ALTER TABLE users DROP CHECK users_chk_1;
ALTER TABLE users ADD CONSTRAINT users_chk_1
  CHECK (role in ('student','lecturer','staff_admin','hod_dean','guest_lecturer'));

-- Pre-requisites for backfill: Ensure we have at least one academic year, faculty, department, and batch
INSERT INTO academic_years (year_label, start_date, end_date, is_current)
SELECT '2026', '2026-01-01', '2026-12-31', 1
FROM dual
WHERE NOT EXISTS (SELECT 1 FROM academic_years);

INSERT INTO faculties (name, code)
SELECT 'Faculty of Computing', 'FOC'
FROM dual
WHERE NOT EXISTS (SELECT 1 FROM faculties);

INSERT INTO departments (faculty_id, name, code)
SELECT (SELECT faculty_id FROM faculties LIMIT 1), 'Department of Software Engineering', 'DSE'
FROM dual
WHERE NOT EXISTS (SELECT 1 FROM departments);

INSERT INTO batches (department_id, academic_year_id, name)
SELECT (SELECT department_id FROM departments LIMIT 1), (SELECT academic_year_id FROM academic_years LIMIT 1), '2026-SE-A'
FROM dual
WHERE NOT EXISTS (SELECT 1 FROM batches);

-- 6. Backfill missing extension rows for the four seeded demo users
INSERT INTO students (student_id, student_no, department_id, batch_id, enrollment_year)
  SELECT u.user_id, CONCAT('STU-', u.user_id), (SELECT department_id FROM departments LIMIT 1),
         (SELECT batch_id FROM batches LIMIT 1), 2026
  FROM users u WHERE u.email = 'student@uni.edu'
    AND NOT EXISTS (SELECT 1 FROM students s WHERE s.student_id = u.user_id);

INSERT INTO lecturers (lecturer_id, department_id, designation, is_guest)
  SELECT u.user_id, (SELECT department_id FROM departments LIMIT 1), 'Senior Lecturer', 0
  FROM users u WHERE u.email = 'lecturer@uni.edu'
    AND NOT EXISTS (SELECT 1 FROM lecturers l WHERE l.lecturer_id = u.user_id);

INSERT INTO staff_admins (staff_id, scope_level, department_id)
  SELECT u.user_id, 'INSTITUTION', (SELECT department_id FROM departments LIMIT 1)
  FROM users u WHERE u.email = 'admin@uni.edu'
    AND NOT EXISTS (SELECT 1 FROM staff_admins sa WHERE sa.staff_id = u.user_id);

INSERT INTO hod_dean_assignments (user_id, scope_type, department_id, active)
  SELECT u.user_id, 'department', (SELECT department_id FROM departments LIMIT 1), 1
  FROM users u WHERE u.email = 'hod@uni.edu'
    AND NOT EXISTS (SELECT 1 FROM hod_dean_assignments h WHERE h.user_id = u.user_id AND h.active = 1);
