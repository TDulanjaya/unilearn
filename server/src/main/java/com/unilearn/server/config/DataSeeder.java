package com.unilearn.server.config;

import com.unilearn.server.model.*;
import com.unilearn.server.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDate;

// @Component - DataSeeder is disabled.
@RequiredArgsConstructor
@Slf4j
public class DataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final StudentRepository studentRepository;
    private final LecturerRepository lecturerRepository;
    private final StaffAdminRepository staffAdminRepository;
    private final HodDeanAssignmentRepository hodDeanAssignmentRepository;
    private final AcademicYearRepository academicYearRepository;
    private final FacultyRepository facultyRepository;
    private final DepartmentRepository departmentRepository;
    private final BatchRepository batchRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {

    }

    private void seedAcademicStructureIfMissing() {
        if (academicYearRepository.count() == 0) {
            AcademicYear ay = AcademicYear.builder()
                    .yearLabel("2026")
                    .startDate(LocalDate.of(2026, 1, 1))
                    .endDate(LocalDate.of(2026, 12, 31))
                    .isCurrent(true)
                    .build();
            academicYearRepository.save(ay);
            log.info("Seeded default academic year");
        }
        if (facultyRepository.count() == 0) {
            Faculty f = Faculty.builder()
                    .name("Faculty of Computing")
                    .code("FOC")
                    .build();
            facultyRepository.save(f);
            log.info("Seeded default faculty");
        }
        if (departmentRepository.count() == 0) {
            Faculty f = facultyRepository.findAll().stream().findFirst().orElse(null);
            Department d = Department.builder()
                    .faculty(f)
                    .name("Department of Software Engineering")
                    .code("DSE")
                    .build();
            departmentRepository.save(d);
            log.info("Seeded default department");
        }
        if (batchRepository.count() == 0) {
            Department d = departmentRepository.findAll().stream().findFirst().orElse(null);
            AcademicYear ay = academicYearRepository.findAll().stream().findFirst().orElse(null);
            Batch b = Batch.builder()
                    .department(d)
                    .academicYear(ay)
                    .name("2026-SE-A")
                    .build();
            batchRepository.save(b);
            log.info("Seeded default batch");
        }
    }

    private void seedIfMissing(String email, String fullName, String rawPassword, String role, String phone) {
        if (!userRepository.existsByEmail(email)) {
            User user = User.builder()
                    .fullName(fullName)
                    .email(email)
                    .passwordHash(passwordEncoder.encode(rawPassword))
                    .phone(phone)
                    .role(role)
                    .status("ACTIVE")
                    .build();
            User saved = userRepository.save(user);
            log.info("Seeded default user: {}", email);

            // Create extension rows
            String roleName = role.toUpperCase();
            var dept = departmentRepository.findAll().stream().findFirst().orElse(null);
            var batch = batchRepository.findAll().stream().findFirst().orElse(null);

            if ("STUDENT".equals(roleName)) {
                if (!studentRepository.existsById(saved.getUserId())) {
                    Student student = Student.builder()
                            .user(saved)
                            .studentNo("STU-" + saved.getUserId())
                            .department(dept)
                            .batch(batch)
                            .enrollmentYear(2026)
                            .build();
                    studentRepository.save(student);
                }
            } else if ("LECTURER".equals(roleName)) {
                if (!lecturerRepository.existsById(saved.getUserId())) {
                    Lecturer lecturer = Lecturer.builder()
                            .user(saved)
                            .department(dept)
                            .designation("Senior Lecturer")
                            .isGuest(false)
                            .build();
                    lecturerRepository.save(lecturer);
                }
            } else if ("STAFF_ADMIN".equals(roleName)) {
                if (!staffAdminRepository.existsById(saved.getUserId())) {
                    StaffAdmin staffAdmin = StaffAdmin.builder()
                            .user(saved)
                            .scopeLevel("INSTITUTION")
                            .department(dept)
                            .build();
                    staffAdminRepository.save(staffAdmin);
                }
            } else if ("HOD_DEAN".equals(roleName)) {
                boolean exists = hodDeanAssignmentRepository.findAll().stream()
                        .anyMatch(a -> a.getUser().getUserId().equals(saved.getUserId()) && a.getActive());
                if (!exists) {
                    HodDeanAssignment assignment = HodDeanAssignment.builder()
                            .user(saved)
                            .scopeType("department")
                            .department(dept)
                            .active(true)
                            .build();
                    hodDeanAssignmentRepository.save(assignment);
                }
            }
        }
    }
}
