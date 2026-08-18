CREATE DATABASE IF NOT EXISTS `unilearn_db` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;
USE `unilearn_db`;

SET FOREIGN_KEY_CHECKS = 0;

-- Table: academic_years
DROP TABLE IF EXISTS `academic_years`;
CREATE TABLE `academic_years` (
  `academic_year_id` int NOT NULL AUTO_INCREMENT,
  `year_label` varchar(20) NOT NULL,
  `start_date` date NOT NULL,
  `end_date` date NOT NULL,
  `is_current` bit(1) DEFAULT NULL,
  PRIMARY KEY (`academic_year_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Table: faculties
DROP TABLE IF EXISTS `faculties`;
CREATE TABLE `faculties` (
  `faculty_id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(150) NOT NULL,
  `code` varchar(20) NOT NULL,
  `dean_user_id` int DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`faculty_id`),
  UNIQUE KEY `code` (`code`),
  KEY `fk_faculty_dean` (`dean_user_id`),
  CONSTRAINT `fk_faculty_dean` FOREIGN KEY (`dean_user_id`) REFERENCES `users` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Table: departments
DROP TABLE IF EXISTS `departments`;
CREATE TABLE `departments` (
  `department_id` int NOT NULL AUTO_INCREMENT,
  `faculty_id` int NOT NULL,
  `name` varchar(150) NOT NULL,
  `code` varchar(20) NOT NULL,
  `hod_user_id` int DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`department_id`),
  UNIQUE KEY `code` (`code`),
  KEY `faculty_id` (`faculty_id`),
  KEY `fk_dept_hod` (`hod_user_id`),
  CONSTRAINT `departments_ibfk_1` FOREIGN KEY (`faculty_id`) REFERENCES `faculties` (`faculty_id`),
  CONSTRAINT `fk_dept_hod` FOREIGN KEY (`hod_user_id`) REFERENCES `users` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Table: batches
DROP TABLE IF EXISTS `batches`;
CREATE TABLE `batches` (
  `batch_id` int NOT NULL AUTO_INCREMENT,
  `department_id` int NOT NULL,
  `academic_year_id` int NOT NULL,
  `name` varchar(50) NOT NULL,
  PRIMARY KEY (`batch_id`),
  KEY `department_id` (`department_id`),
  KEY `academic_year_id` (`academic_year_id`),
  CONSTRAINT `batches_ibfk_1` FOREIGN KEY (`department_id`) REFERENCES `departments` (`department_id`),
  CONSTRAINT `batches_ibfk_2` FOREIGN KEY (`academic_year_id`) REFERENCES `academic_years` (`academic_year_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Table: semesters
DROP TABLE IF EXISTS `semesters`;
CREATE TABLE `semesters` (
  `semester_id` int NOT NULL AUTO_INCREMENT,
  `academic_year_id` int NOT NULL,
  `name` varchar(50) NOT NULL,
  `start_date` date NOT NULL,
  `end_date` date NOT NULL,
  PRIMARY KEY (`semester_id`),
  KEY `academic_year_id` (`academic_year_id`),
  CONSTRAINT `semesters_ibfk_1` FOREIGN KEY (`academic_year_id`) REFERENCES `academic_years` (`academic_year_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Table: users
DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
  `user_id` int NOT NULL AUTO_INCREMENT,
  `full_name` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `phone` varchar(30) DEFAULT NULL,
  `photo_url` varchar(255) DEFAULT NULL,
  `role` varchar(20) NOT NULL,
  `status` varchar(20) DEFAULT 'active',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`user_id`),
  UNIQUE KEY `email` (`email`),
  CONSTRAINT `users_chk_1` CHECK ((`role` in (_utf8mb4'student',_utf8mb4'lecturer',_utf8mb4'examiner',_utf8mb4'staff_admin',_utf8mb4'hod_dean',_utf8mb4'guest_lecturer'))),
  CONSTRAINT `users_chk_2` CHECK ((`status` in (_utf8mb4'active',_utf8mb4'inactive',_utf8mb4'suspended')))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Table: students
DROP TABLE IF EXISTS `students`;
CREATE TABLE `students` (
  `student_id` int NOT NULL,
  `student_no` varchar(30) NOT NULL,
  `department_id` int NOT NULL,
  `batch_id` int NOT NULL,
  `enrollment_year` int NOT NULL,
  PRIMARY KEY (`student_id`),
  UNIQUE KEY `student_no` (`student_no`),
  KEY `idx_students_department` (`department_id`),
  KEY `idx_students_batch` (`batch_id`),
  CONSTRAINT `students_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `users` (`user_id`),
  CONSTRAINT `students_ibfk_2` FOREIGN KEY (`department_id`) REFERENCES `departments` (`department_id`),
  CONSTRAINT `students_ibfk_3` FOREIGN KEY (`batch_id`) REFERENCES `batches` (`batch_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Table: lecturers
DROP TABLE IF EXISTS `lecturers`;
CREATE TABLE `lecturers` (
  `lecturer_id` int NOT NULL,
  `department_id` int NOT NULL,
  `designation` varchar(100) DEFAULT NULL,
  `is_guest` tinyint(1) DEFAULT '0',
  `contract_end_date` date DEFAULT NULL,
  PRIMARY KEY (`lecturer_id`),
  KEY `idx_lecturers_department` (`department_id`),
  CONSTRAINT `lecturers_ibfk_1` FOREIGN KEY (`lecturer_id`) REFERENCES `users` (`user_id`),
  CONSTRAINT `lecturers_ibfk_2` FOREIGN KEY (`department_id`) REFERENCES `departments` (`department_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Table: staff_admins
DROP TABLE IF EXISTS `staff_admins`;
CREATE TABLE `staff_admins` (
  `staff_id` int NOT NULL,
  `scope_level` varchar(20) NOT NULL,
  `faculty_id` int DEFAULT NULL,
  `department_id` int DEFAULT NULL,
  PRIMARY KEY (`staff_id`),
  KEY `faculty_id` (`faculty_id`),
  KEY `department_id` (`department_id`),
  CONSTRAINT `staff_admins_ibfk_1` FOREIGN KEY (`staff_id`) REFERENCES `users` (`user_id`),
  CONSTRAINT `staff_admins_ibfk_2` FOREIGN KEY (`faculty_id`) REFERENCES `faculties` (`faculty_id`),
  CONSTRAINT `staff_admins_ibfk_3` FOREIGN KEY (`department_id`) REFERENCES `departments` (`department_id`),
  CONSTRAINT `staff_admins_chk_1` CHECK ((`scope_level` in (_utf8mb4'institution',_utf8mb4'faculty',_utf8mb4'department')))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Table: hod_dean_assignments
DROP TABLE IF EXISTS `hod_dean_assignments`;
CREATE TABLE `hod_dean_assignments` (
  `assignment_id` bigint NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `scope_type` varchar(20) NOT NULL,
  `faculty_id` int DEFAULT NULL,
  `department_id` int DEFAULT NULL,
  `active` bit(1) DEFAULT NULL,
  `end_date` date DEFAULT NULL,
  PRIMARY KEY (`assignment_id`),
  KEY `user_id` (`user_id`),
  KEY `faculty_id` (`faculty_id`),
  KEY `department_id` (`department_id`),
  CONSTRAINT `hod_dean_assignments_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`),
  CONSTRAINT `hod_dean_assignments_ibfk_2` FOREIGN KEY (`faculty_id`) REFERENCES `faculties` (`faculty_id`),
  CONSTRAINT `hod_dean_assignments_ibfk_3` FOREIGN KEY (`department_id`) REFERENCES `departments` (`department_id`),
  CONSTRAINT `hod_dean_assignments_chk_1` CHECK ((`scope_type` in (_utf8mb4'faculty',_utf8mb4'department')))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Table: courses
DROP TABLE IF EXISTS `courses`;
CREATE TABLE `courses` (
  `course_id` int NOT NULL AUTO_INCREMENT,
  `department_id` int NOT NULL,
  `code` varchar(20) NOT NULL,
  `title` varchar(200) NOT NULL,
  `credit_hours` int NOT NULL,
  `description` longtext,
  `syllabus_version` varchar(20) DEFAULT 'v1',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`course_id`),
  UNIQUE KEY `code` (`code`),
  KEY `department_id` (`department_id`),
  CONSTRAINT `courses_ibfk_1` FOREIGN KEY (`department_id`) REFERENCES `departments` (`department_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Table: course_offerings
DROP TABLE IF EXISTS `course_offerings`;
CREATE TABLE `course_offerings` (
  `offering_id` int NOT NULL AUTO_INCREMENT,
  `course_id` int NOT NULL,
  `batch_id` int NOT NULL,
  `semester_id` int NOT NULL,
  `lecturer_id` int NOT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `capacity` int DEFAULT NULL,
  PRIMARY KEY (`offering_id`),
  KEY `semester_id` (`semester_id`),
  KEY `lecturer_id` (`lecturer_id`),
  KEY `idx_offerings_course` (`course_id`),
  KEY `idx_offerings_batch` (`batch_id`),
  CONSTRAINT `course_offerings_ibfk_1` FOREIGN KEY (`course_id`) REFERENCES `courses` (`course_id`),
  CONSTRAINT `course_offerings_ibfk_2` FOREIGN KEY (`batch_id`) REFERENCES `batches` (`batch_id`),
  CONSTRAINT `course_offerings_ibfk_3` FOREIGN KEY (`semester_id`) REFERENCES `semesters` (`semester_id`),
  CONSTRAINT `course_offerings_ibfk_4` FOREIGN KEY (`lecturer_id`) REFERENCES `lecturers` (`lecturer_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Table: course_offering_lecturers
DROP TABLE IF EXISTS `course_offering_lecturers`;
CREATE TABLE `course_offering_lecturers` (
  `offering_id` int NOT NULL,
  `lecturer_id` int NOT NULL,
  PRIMARY KEY (`offering_id`,`lecturer_id`),
  KEY `lecturer_id` (`lecturer_id`),
  CONSTRAINT `course_offering_lecturers_ibfk_1` FOREIGN KEY (`offering_id`) REFERENCES `course_offerings` (`offering_id`),
  CONSTRAINT `course_offering_lecturers_ibfk_2` FOREIGN KEY (`lecturer_id`) REFERENCES `lecturers` (`lecturer_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Table: enrollments
DROP TABLE IF EXISTS `enrollments`;
CREATE TABLE `enrollments` (
  `enrollment_id` bigint NOT NULL AUTO_INCREMENT,
  `student_id` int NOT NULL,
  `offering_id` int NOT NULL,
  `enrollment_date` date DEFAULT (curdate()),
  `status` varchar(20) DEFAULT 'active',
  PRIMARY KEY (`enrollment_id`),
  UNIQUE KEY `student_id` (`student_id`,`offering_id`),
  KEY `idx_enrollments_student` (`student_id`),
  KEY `idx_enrollments_offering` (`offering_id`),
  CONSTRAINT `enrollments_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `students` (`student_id`),
  CONSTRAINT `enrollments_ibfk_2` FOREIGN KEY (`offering_id`) REFERENCES `course_offerings` (`offering_id`),
  CONSTRAINT `enrollments_chk_1` CHECK ((`status` in (_utf8mb4'active',_utf8mb4'dropped',_utf8mb4'completed')))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Table: materials
DROP TABLE IF EXISTS `materials`;
CREATE TABLE `materials` (
  `material_id` bigint NOT NULL AUTO_INCREMENT,
  `offering_id` int NOT NULL,
  `title` varchar(200) NOT NULL,
  `resource_type` varchar(20) NOT NULL,
  `file_url` varchar(500) DEFAULT NULL,
  `link_url` varchar(500) DEFAULT NULL,
  `uploaded_by` int NOT NULL,
  `uploaded_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`material_id`),
  KEY `uploaded_by` (`uploaded_by`),
  KEY `idx_materials_offering` (`offering_id`),
  CONSTRAINT `materials_ibfk_1` FOREIGN KEY (`offering_id`) REFERENCES `course_offerings` (`offering_id`),
  CONSTRAINT `materials_ibfk_2` FOREIGN KEY (`uploaded_by`) REFERENCES `lecturers` (`lecturer_id`),
  CONSTRAINT `materials_chk_1` CHECK ((`resource_type` in (_utf8mb4'pdf',_utf8mb4'video',_utf8mb4'slides',_utf8mb4'link',_utf8mb4'other'))),
  CONSTRAINT `materials_chk_2` CHECK ((((`resource_type` = _utf8mb4'link') and (`link_url` is not null)) or ((`resource_type` <> _utf8mb4'link') and (`file_url` is not null))))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Table: timetable_slots
DROP TABLE IF EXISTS `timetable_slots`;
CREATE TABLE `timetable_slots` (
  `slot_id` int NOT NULL AUTO_INCREMENT,
  `offering_id` int NOT NULL,
  `day_of_week` varchar(10) NOT NULL,
  `start_time` time NOT NULL,
  `end_time` time NOT NULL,
  `venue` varchar(100) DEFAULT NULL,
  `slot_type` varchar(20) DEFAULT 'lecture',
  PRIMARY KEY (`slot_id`),
  KEY `idx_timetable_offering` (`offering_id`),
  CONSTRAINT `timetable_slots_ibfk_1` FOREIGN KEY (`offering_id`) REFERENCES `course_offerings` (`offering_id`),
  CONSTRAINT `timetable_slots_chk_1` CHECK ((`day_of_week` in (_utf8mb4'Mon',_utf8mb4'Tue',_utf8mb4'Wed',_utf8mb4'Thu',_utf8mb4'Fri',_utf8mb4'Sat',_utf8mb4'Sun'))),
  CONSTRAINT `timetable_slots_chk_2` CHECK ((`slot_type` in (_utf8mb4'lecture',_utf8mb4'lab',_utf8mb4'tutorial')))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Table: assignments
DROP TABLE IF EXISTS `assignments`;
CREATE TABLE `assignments` (
  `assignment_id` int NOT NULL AUTO_INCREMENT,
  `offering_id` int NOT NULL,
  `title` varchar(200) NOT NULL,
  `description` longtext,
  `deadline` datetime NOT NULL,
  `max_score` decimal(6,2) NOT NULL,
  `allow_resubmission` tinyint(1) DEFAULT '0',
  `created_by` int NOT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`assignment_id`),
  KEY `offering_id` (`offering_id`),
  KEY `created_by` (`created_by`),
  CONSTRAINT `assignments_ibfk_1` FOREIGN KEY (`offering_id`) REFERENCES `course_offerings` (`offering_id`),
  CONSTRAINT `assignments_ibfk_2` FOREIGN KEY (`created_by`) REFERENCES `lecturers` (`lecturer_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Table: submissions
DROP TABLE IF EXISTS `submissions`;
CREATE TABLE `submissions` (
  `submission_id` bigint NOT NULL AUTO_INCREMENT,
  `assignment_id` int NOT NULL,
  `student_id` int NOT NULL,
  `file_url` varchar(500) DEFAULT NULL,
  `submitted_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `is_resubmission` tinyint(1) DEFAULT '0',
  `grade` decimal(6,2) DEFAULT NULL,
  `feedback` longtext,
  `graded_by` int DEFAULT NULL,
  `graded_at` datetime DEFAULT NULL,
  `is_late` bit(1) DEFAULT NULL,
  PRIMARY KEY (`submission_id`),
  KEY `assignment_id` (`assignment_id`),
  KEY `graded_by` (`graded_by`),
  KEY `idx_submissions_student` (`student_id`),
  CONSTRAINT `submissions_ibfk_1` FOREIGN KEY (`assignment_id`) REFERENCES `assignments` (`assignment_id`),
  CONSTRAINT `submissions_ibfk_2` FOREIGN KEY (`student_id`) REFERENCES `students` (`student_id`),
  CONSTRAINT `submissions_ibfk_3` FOREIGN KEY (`graded_by`) REFERENCES `lecturers` (`lecturer_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Table: gradebook_entries
DROP TABLE IF EXISTS `gradebook_entries`;
CREATE TABLE `gradebook_entries` (
  `gradebook_id` bigint NOT NULL AUTO_INCREMENT,
  `offering_id` int NOT NULL,
  `student_id` int NOT NULL,
  `component` varchar(30) NOT NULL,
  `component_ref_id` int DEFAULT NULL,
  `weight_pct` decimal(5,2) NOT NULL,
  `score` decimal(6,2) NOT NULL,
  PRIMARY KEY (`gradebook_id`),
  KEY `offering_id` (`offering_id`),
  KEY `student_id` (`student_id`),
  CONSTRAINT `gradebook_entries_ibfk_1` FOREIGN KEY (`offering_id`) REFERENCES `course_offerings` (`offering_id`),
  CONSTRAINT `gradebook_entries_ibfk_2` FOREIGN KEY (`student_id`) REFERENCES `students` (`student_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Table: question_banks
DROP TABLE IF EXISTS `question_banks`;
CREATE TABLE `question_banks` (
  `bank_id` int NOT NULL AUTO_INCREMENT,
  `course_id` int NOT NULL,
  `created_by` int NOT NULL,
  PRIMARY KEY (`bank_id`),
  KEY `course_id` (`course_id`),
  KEY `created_by` (`created_by`),
  CONSTRAINT `question_banks_ibfk_1` FOREIGN KEY (`course_id`) REFERENCES `courses` (`course_id`),
  CONSTRAINT `question_banks_ibfk_2` FOREIGN KEY (`created_by`) REFERENCES `examiners` (`examiner_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Table: questions
DROP TABLE IF EXISTS `questions`;
CREATE TABLE `questions` (
  `question_id` int NOT NULL AUTO_INCREMENT,
  `bank_id` int NOT NULL,
  `question_text` tinytext NOT NULL,
  `question_type` varchar(20) NOT NULL,
  `options` json DEFAULT NULL,
  `correct_answer` longtext,
  `marks` decimal(5,2) NOT NULL,
  `difficulty` varchar(10) DEFAULT NULL,
  `topic` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`question_id`),
  KEY `bank_id` (`bank_id`),
  CONSTRAINT `questions_ibfk_1` FOREIGN KEY (`bank_id`) REFERENCES `question_banks` (`bank_id`),
  CONSTRAINT `questions_chk_1` CHECK ((`question_type` in (_utf8mb4'mcq',_utf8mb4'essay',_utf8mb4'short_answer'))),
  CONSTRAINT `questions_chk_2` CHECK ((`difficulty` in (_utf8mb4'easy',_utf8mb4'medium',_utf8mb4'hard')))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Table: exams
DROP TABLE IF EXISTS `exams`;
CREATE TABLE `exams` (
  `exam_id` int NOT NULL AUTO_INCREMENT,
  `offering_id` int NOT NULL,
  `exam_type` varchar(20) NOT NULL,
  `scheduled_by_user_id` int NOT NULL,
  `linked_slot_id` int DEFAULT NULL,
  `exam_date` date NOT NULL,
  `start_time` time NOT NULL,
  `end_time` time NOT NULL,
  `venue` varchar(100) DEFAULT NULL,
  `duration_minutes` int NOT NULL,
  `status` varchar(20) DEFAULT 'published',
  `examiner_id` bigint DEFAULT NULL,
  PRIMARY KEY (`exam_id`),
  KEY `scheduled_by_user_id` (`scheduled_by_user_id`),
  KEY `linked_slot_id` (`linked_slot_id`),
  KEY `idx_exams_offering` (`offering_id`),
  KEY `idx_exams_type` (`exam_type`),
  CONSTRAINT `exams_ibfk_1` FOREIGN KEY (`offering_id`) REFERENCES `course_offerings` (`offering_id`),
  CONSTRAINT `exams_ibfk_2` FOREIGN KEY (`scheduled_by_user_id`) REFERENCES `users` (`user_id`),
  CONSTRAINT `exams_ibfk_3` FOREIGN KEY (`linked_slot_id`) REFERENCES `timetable_slots` (`slot_id`),
  CONSTRAINT `exams_chk_1` CHECK ((`exam_type` in (_utf8mb4'final',_utf8mb4'midterm_inclass'))),
  CONSTRAINT `exams_chk_2` CHECK ((`status` in (_utf8mb4'draft',_utf8mb4'published',_utf8mb4'cancelled'))),
  CONSTRAINT `exams_chk_3` CHECK ((((`exam_type` = _utf8mb4'midterm_inclass') and (`linked_slot_id` is not null)) or (`exam_type` = _utf8mb4'final')))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Table: exam_questions
DROP TABLE IF EXISTS `exam_questions`;
CREATE TABLE `exam_questions` (
  `exam_id` int NOT NULL,
  `question_id` int NOT NULL,
  `marks_override` decimal(5,2) DEFAULT NULL,
  `question_order` int DEFAULT NULL,
  PRIMARY KEY (`exam_id`,`question_id`),
  KEY `question_id` (`question_id`),
  CONSTRAINT `exam_questions_ibfk_1` FOREIGN KEY (`exam_id`) REFERENCES `exams` (`exam_id`),
  CONSTRAINT `exam_questions_ibfk_2` FOREIGN KEY (`question_id`) REFERENCES `questions` (`question_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Table: exam_attempts
DROP TABLE IF EXISTS `exam_attempts`;
CREATE TABLE `exam_attempts` (
  `attempt_id` int NOT NULL AUTO_INCREMENT,
  `exam_id` int NOT NULL,
  `student_id` int NOT NULL,
  `start_time` datetime DEFAULT NULL,
  `end_time` datetime DEFAULT NULL,
  `status` varchar(20) DEFAULT 'not_started',
  PRIMARY KEY (`attempt_id`),
  UNIQUE KEY `exam_id` (`exam_id`,`student_id`),
  KEY `student_id` (`student_id`),
  CONSTRAINT `exam_attempts_ibfk_1` FOREIGN KEY (`exam_id`) REFERENCES `exams` (`exam_id`),
  CONSTRAINT `exam_attempts_ibfk_2` FOREIGN KEY (`student_id`) REFERENCES `students` (`student_id`),
  CONSTRAINT `exam_attempts_chk_1` CHECK ((`status` in (_utf8mb4'not_started',_utf8mb4'in_progress',_utf8mb4'submitted',_utf8mb4'flagged')))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Table: exam_answers
DROP TABLE IF EXISTS `exam_answers`;
CREATE TABLE `exam_answers` (
  `answer_id` bigint NOT NULL AUTO_INCREMENT,
  `attempt_id` int NOT NULL,
  `question_id` int NOT NULL,
  `answer_text` longtext,
  `is_correct` tinyint(1) DEFAULT NULL,
  `marks_awarded` decimal(5,2) DEFAULT NULL,
  `graded_by` int DEFAULT NULL,
  PRIMARY KEY (`answer_id`),
  KEY `attempt_id` (`attempt_id`),
  KEY `question_id` (`question_id`),
  KEY `graded_by` (`graded_by`),
  CONSTRAINT `exam_answers_ibfk_1` FOREIGN KEY (`attempt_id`) REFERENCES `exam_attempts` (`attempt_id`),
  CONSTRAINT `exam_answers_ibfk_2` FOREIGN KEY (`question_id`) REFERENCES `questions` (`question_id`),
  CONSTRAINT `exam_answers_ibfk_3` FOREIGN KEY (`graded_by`) REFERENCES `examiners` (`examiner_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Table: exam_results
DROP TABLE IF EXISTS `exam_results`;
CREATE TABLE `exam_results` (
  `result_id` bigint NOT NULL AUTO_INCREMENT,
  `exam_id` int NOT NULL,
  `student_id` int NOT NULL,
  `score` decimal(6,2) NOT NULL,
  `grade` varchar(5) DEFAULT NULL,
  `published_at` datetime DEFAULT NULL,
  PRIMARY KEY (`result_id`),
  UNIQUE KEY `exam_id` (`exam_id`,`student_id`),
  KEY `student_id` (`student_id`),
  CONSTRAINT `exam_results_ibfk_1` FOREIGN KEY (`exam_id`) REFERENCES `exams` (`exam_id`),
  CONSTRAINT `exam_results_ibfk_2` FOREIGN KEY (`student_id`) REFERENCES `students` (`student_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Table: proctoring_flags
DROP TABLE IF EXISTS `proctoring_flags`;
CREATE TABLE `proctoring_flags` (
  `flag_id` bigint NOT NULL AUTO_INCREMENT,
  `attempt_id` int NOT NULL,
  `flag_type` varchar(50) NOT NULL,
  `flagged_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `notes` longtext,
  `false_positive` bit(1) DEFAULT NULL,
  `review_notes` longtext,
  `reviewed` bit(1) DEFAULT NULL,
  PRIMARY KEY (`flag_id`),
  KEY `attempt_id` (`attempt_id`),
  CONSTRAINT `proctoring_flags_ibfk_1` FOREIGN KEY (`attempt_id`) REFERENCES `exam_attempts` (`attempt_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Table: examiners
DROP TABLE IF EXISTS `examiners`;
CREATE TABLE `examiners` (
  `examiner_id` int NOT NULL,
  `department_id` int NOT NULL,
  PRIMARY KEY (`examiner_id`),
  KEY `department_id` (`department_id`),
  CONSTRAINT `examiners_ibfk_1` FOREIGN KEY (`examiner_id`) REFERENCES `users` (`user_id`),
  CONSTRAINT `examiners_ibfk_2` FOREIGN KEY (`department_id`) REFERENCES `departments` (`department_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Table: attendance_sessions
DROP TABLE IF EXISTS `attendance_sessions`;
CREATE TABLE `attendance_sessions` (
  `session_id` int NOT NULL AUTO_INCREMENT,
  `offering_id` int NOT NULL,
  `session_date` date NOT NULL,
  `marked_by` int NOT NULL,
  PRIMARY KEY (`session_id`),
  KEY `offering_id` (`offering_id`),
  KEY `marked_by` (`marked_by`),
  CONSTRAINT `attendance_sessions_ibfk_1` FOREIGN KEY (`offering_id`) REFERENCES `course_offerings` (`offering_id`),
  CONSTRAINT `attendance_sessions_ibfk_2` FOREIGN KEY (`marked_by`) REFERENCES `lecturers` (`lecturer_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Table: attendance_records
DROP TABLE IF EXISTS `attendance_records`;
CREATE TABLE `attendance_records` (
  `record_id` bigint NOT NULL AUTO_INCREMENT,
  `session_id` int NOT NULL,
  `student_id` int NOT NULL,
  `status` varchar(10) NOT NULL,
  PRIMARY KEY (`record_id`),
  UNIQUE KEY `session_id` (`session_id`,`student_id`),
  KEY `idx_attendance_records_student` (`student_id`),
  CONSTRAINT `attendance_records_ibfk_1` FOREIGN KEY (`session_id`) REFERENCES `attendance_sessions` (`session_id`),
  CONSTRAINT `attendance_records_ibfk_2` FOREIGN KEY (`student_id`) REFERENCES `students` (`student_id`),
  CONSTRAINT `attendance_records_chk_1` CHECK ((`status` in (_utf8mb4'present',_utf8mb4'absent',_utf8mb4'late')))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Table: events
DROP TABLE IF EXISTS `events`;
CREATE TABLE `events` (
  `event_id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(200) NOT NULL,
  `description` longtext,
  `venue` varchar(100) DEFAULT NULL,
  `event_date` datetime NOT NULL,
  `faculty_id` int DEFAULT NULL,
  `created_by` int NOT NULL,
  `capacity` int DEFAULT NULL,
  PRIMARY KEY (`event_id`),
  KEY `faculty_id` (`faculty_id`),
  KEY `created_by` (`created_by`),
  CONSTRAINT `events_ibfk_1` FOREIGN KEY (`faculty_id`) REFERENCES `faculties` (`faculty_id`),
  CONSTRAINT `events_ibfk_2` FOREIGN KEY (`created_by`) REFERENCES `staff_admins` (`staff_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Table: event_registrations
DROP TABLE IF EXISTS `event_registrations`;
CREATE TABLE `event_registrations` (
  `registration_id` bigint NOT NULL AUTO_INCREMENT,
  `event_id` int NOT NULL,
  `student_id` int NOT NULL,
  `registered_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`registration_id`),
  UNIQUE KEY `event_id` (`event_id`,`student_id`),
  KEY `student_id` (`student_id`),
  CONSTRAINT `event_registrations_ibfk_1` FOREIGN KEY (`event_id`) REFERENCES `events` (`event_id`),
  CONSTRAINT `event_registrations_ibfk_2` FOREIGN KEY (`student_id`) REFERENCES `students` (`student_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Table: announcements
DROP TABLE IF EXISTS `announcements`;
CREATE TABLE `announcements` (
  `announcement_id` bigint NOT NULL AUTO_INCREMENT,
  `scope` varchar(20) NOT NULL,
  `offering_id` int DEFAULT NULL,
  `department_id` int DEFAULT NULL,
  `faculty_id` int DEFAULT NULL,
  `title` varchar(200) NOT NULL,
  `content` tinytext NOT NULL,
  `posted_by` int NOT NULL,
  `posted_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`announcement_id`),
  KEY `offering_id` (`offering_id`),
  KEY `department_id` (`department_id`),
  KEY `faculty_id` (`faculty_id`),
  KEY `posted_by` (`posted_by`),
  CONSTRAINT `announcements_ibfk_1` FOREIGN KEY (`offering_id`) REFERENCES `course_offerings` (`offering_id`),
  CONSTRAINT `announcements_ibfk_2` FOREIGN KEY (`department_id`) REFERENCES `departments` (`department_id`),
  CONSTRAINT `announcements_ibfk_3` FOREIGN KEY (`faculty_id`) REFERENCES `faculties` (`faculty_id`),
  CONSTRAINT `announcements_ibfk_4` FOREIGN KEY (`posted_by`) REFERENCES `users` (`user_id`),
  CONSTRAINT `announcements_chk_1` CHECK ((`scope` in (_utf8mb4'course',_utf8mb4'department',_utf8mb4'faculty',_utf8mb4'institution')))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Table: messages
DROP TABLE IF EXISTS `messages`;
CREATE TABLE `messages` (
  `message_id` bigint NOT NULL AUTO_INCREMENT,
  `sender_id` int NOT NULL,
  `receiver_id` int NOT NULL,
  `content` tinytext NOT NULL,
  `sent_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `read_at` datetime DEFAULT NULL,
  PRIMARY KEY (`message_id`),
  KEY `sender_id` (`sender_id`),
  KEY `receiver_id` (`receiver_id`),
  CONSTRAINT `messages_ibfk_1` FOREIGN KEY (`sender_id`) REFERENCES `users` (`user_id`),
  CONSTRAINT `messages_ibfk_2` FOREIGN KEY (`receiver_id`) REFERENCES `users` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Table: forum_posts
DROP TABLE IF EXISTS `forum_posts`;
CREATE TABLE `forum_posts` (
  `post_id` int NOT NULL AUTO_INCREMENT,
  `offering_id` int NOT NULL,
  `parent_post_id` int DEFAULT NULL,
  `author_id` int NOT NULL,
  `content` tinytext NOT NULL,
  `posted_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`post_id`),
  KEY `offering_id` (`offering_id`),
  KEY `parent_post_id` (`parent_post_id`),
  KEY `author_id` (`author_id`),
  CONSTRAINT `forum_posts_ibfk_1` FOREIGN KEY (`offering_id`) REFERENCES `course_offerings` (`offering_id`),
  CONSTRAINT `forum_posts_ibfk_2` FOREIGN KEY (`parent_post_id`) REFERENCES `forum_posts` (`post_id`),
  CONSTRAINT `forum_posts_ibfk_3` FOREIGN KEY (`author_id`) REFERENCES `users` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Table: notifications
DROP TABLE IF EXISTS `notifications`;
CREATE TABLE `notifications` (
  `notification_id` bigint NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `type` varchar(30) NOT NULL,
  `title` varchar(200) NOT NULL,
  `message` tinytext NOT NULL,
  `ref_table` varchar(50) DEFAULT NULL,
  `ref_id` int DEFAULT NULL,
  `is_read` tinyint(1) DEFAULT '0',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`notification_id`),
  KEY `idx_notifications_user` (`user_id`,`is_read`),
  CONSTRAINT `notifications_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`),
  CONSTRAINT `notifications_chk_1` CHECK ((`type` in (_utf8mb4'inclass_exam',_utf8mb4'final_exam',_utf8mb4'assignment_deadline',_utf8mb4'grade_posted',_utf8mb4'event',_utf8mb4'announcement',_utf8mb4'message')))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Table: ai_chat_messages
DROP TABLE IF EXISTS `ai_chat_messages`;
CREATE TABLE `ai_chat_messages` (
  `message_id` bigint NOT NULL AUTO_INCREMENT,
  `student_id` int NOT NULL,
  `offering_id` int NOT NULL,
  `role` varchar(10) NOT NULL,
  `content` tinytext NOT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`message_id`),
  KEY `offering_id` (`offering_id`),
  KEY `idx_ai_chat_student_offering` (`student_id`,`offering_id`,`created_at`),
  CONSTRAINT `ai_chat_messages_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `students` (`student_id`),
  CONSTRAINT `ai_chat_messages_ibfk_2` FOREIGN KEY (`offering_id`) REFERENCES `course_offerings` (`offering_id`),
  CONSTRAINT `ai_chat_messages_chk_1` CHECK ((`role` in (_utf8mb4'user',_utf8mb4'assistant')))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Table: ai_quiz_sessions
DROP TABLE IF EXISTS `ai_quiz_sessions`;
CREATE TABLE `ai_quiz_sessions` (
  `session_id` int NOT NULL AUTO_INCREMENT,
  `student_id` int NOT NULL,
  `offering_id` int NOT NULL,
  `question_type` varchar(20) NOT NULL,
  `question_count` int NOT NULL,
  `source_scope` varchar(20) NOT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`session_id`),
  KEY `student_id` (`student_id`),
  KEY `offering_id` (`offering_id`),
  CONSTRAINT `ai_quiz_sessions_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `students` (`student_id`),
  CONSTRAINT `ai_quiz_sessions_ibfk_2` FOREIGN KEY (`offering_id`) REFERENCES `course_offerings` (`offering_id`),
  CONSTRAINT `ai_quiz_sessions_chk_1` CHECK ((`question_type` in (_utf8mb4'mcq',_utf8mb4'structured'))),
  CONSTRAINT `ai_quiz_sessions_chk_2` CHECK ((`source_scope` in (_utf8mb4'full_course',_utf8mb4'ongoing_topics')))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Table: ai_quiz_questions
DROP TABLE IF EXISTS `ai_quiz_questions`;
CREATE TABLE `ai_quiz_questions` (
  `question_id` bigint NOT NULL AUTO_INCREMENT,
  `session_id` int NOT NULL,
  `order_no` int NOT NULL,
  `question_text` tinytext NOT NULL,
  `question_type` varchar(20) NOT NULL,
  `options` json DEFAULT NULL,
  `correct_answer` tinytext NOT NULL,
  `student_answer` longtext,
  `is_correct` tinyint(1) DEFAULT NULL,
  `answer_revealed` tinyint(1) DEFAULT '0',
  PRIMARY KEY (`question_id`),
  KEY `idx_ai_quiz_questions_session` (`session_id`),
  CONSTRAINT `ai_quiz_questions_ibfk_1` FOREIGN KEY (`session_id`) REFERENCES `ai_quiz_sessions` (`session_id`),
  CONSTRAINT `ai_quiz_questions_chk_1` CHECK ((`question_type` in (_utf8mb4'mcq',_utf8mb4'structured')))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Table: audit_logs
DROP TABLE IF EXISTS `audit_logs`;
CREATE TABLE `audit_logs` (
  `log_id` bigint NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `action` varchar(100) NOT NULL,
  `entity_type` varchar(50) NOT NULL,
  `entity_id` int NOT NULL,
  `details` json DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`log_id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `audit_logs_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Table: personal_resources
DROP TABLE IF EXISTS `personal_resources`;
CREATE TABLE `personal_resources` (
  `resource_id` bigint NOT NULL AUTO_INCREMENT,
  `student_id` int NOT NULL,
  `offering_id` int NOT NULL,
  `title` varchar(200) NOT NULL,
  `file_url` varchar(500) NOT NULL,
  `file_size_kb` int DEFAULT NULL,
  `uploaded_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`resource_id`),
  KEY `offering_id` (`offering_id`),
  KEY `idx_personal_resources_student` (`student_id`,`offering_id`),
  CONSTRAINT `personal_resources_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `students` (`student_id`),
  CONSTRAINT `personal_resources_ibfk_2` FOREIGN KEY (`offering_id`) REFERENCES `course_offerings` (`offering_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

SET FOREIGN_KEY_CHECKS = 1;