-- ====================================================================
-- UniLearn Baseline Database Seed Script (seed_data.sql)
-- ====================================================================
-- Description:
-- Idempotent SQL script to seed baseline academic structures, courses,
-- and sample users if setting up a fresh database instance manually or via Docker/CI.
--
-- Safe to execute against an existing database (uses INSERT IGNORE / ON DUPLICATE KEY UPDATE).
-- ====================================================================

-- 1. Academic Structure
INSERT IGNORE INTO academic_years (year_id, year_label, start_date, end_date, is_current)
VALUES (1, '2026', '2026-01-01', '2026-12-31', 1);

INSERT IGNORE INTO faculties (faculty_id, name, code)
VALUES (1, 'Faculty of Computing', 'FOC');

INSERT IGNORE INTO departments (department_id, faculty_id, name, code)
VALUES (1, 1, 'Department of Software Engineering', 'DSE');

INSERT IGNORE INTO batches (batch_id, department_id, academic_year_id, name)
VALUES (1, 1, 1, '2026-SE-A');

INSERT IGNORE INTO semesters (semester_id, academic_year_id, name, start_date, end_date)
VALUES (1, 1, 'Semester 1', '2026-01-15', '2026-06-30');

-- 2. Baseline Courses
INSERT IGNORE INTO courses (course_id, department_id, code, title, description, credit_hours, syllabus_version)
VALUES (
    1,
    1,
    'SE308.3',
    'Software Process Management',
    'Software process improvement, agile engineering, quality frameworks, CMMI, and Scrum practices.',
    3,
    'v1'
);

-- 3. Super Administrator
-- Password: 'admin@123'
INSERT IGNORE INTO users (user_id, email, full_name, password_hash, phone, role, status)
VALUES (
    60010,
    'thisaradulanjaya218@gmail.com',
    'thisara dulanajaya',
    '$2a$12$Xls1AAueW3G4sPO0OU/rI.m55FV1MOCCeTKPe1OFY6HBMhO5RgWwC',
    '0770000000',
    'super_admin',
    'active'
);

INSERT IGNORE INTO staff_admins (staff_id, scope_level)
VALUES (60010, 'INSTITUTION');

