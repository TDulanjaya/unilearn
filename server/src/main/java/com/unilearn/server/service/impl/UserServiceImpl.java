package com.unilearn.server.service.impl;

import com.unilearn.server.dto.request.UserRequest;
import com.unilearn.server.dto.response.PageResponseDTO;
import com.unilearn.server.dto.response.UserResponse;
import com.unilearn.server.exception.EntryNotFoundException;
import com.unilearn.server.exception.ValidationException;
import com.unilearn.server.model.User;
import com.unilearn.server.repository.BatchRepository;
import com.unilearn.server.model.Faculty;
import com.unilearn.server.model.Department;
import com.unilearn.server.model.Batch;
import com.unilearn.server.model.Student;
import com.unilearn.server.model.Lecturer;
import com.unilearn.server.model.StaffAdmin;
import com.unilearn.server.model.HodDeanAssignment;
import com.unilearn.server.repository.*;
import com.unilearn.server.model.Message;
import com.unilearn.server.service.UserService;
import com.unilearn.server.util.mapper.UserMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final StudentRepository studentRepository;
    private final LecturerRepository lecturerRepository;
    private final StaffAdminRepository staffAdminRepository;
    private final DepartmentRepository departmentRepository;
    private final BatchRepository batchRepository;
    private final HodDeanAssignmentRepository hodDeanAssignmentRepository;
    private final FacultyRepository facultyRepository;
    private final UserMapper userMapper;
    private final PasswordEncoder passwordEncoder;

    private final EnrollmentRepository enrollmentRepository;
    private final SubmissionRepository submissionRepository;
    private final ExamAttemptRepository examAttemptRepository;
    private final AttendanceRecordRepository attendanceRecordRepository;
    private final CourseOfferingLecturerRepository courseOfferingLecturerRepository;
    private final AssignmentRepository assignmentRepository;
    private final MaterialRepository materialRepository;
    private final GradebookEntryRepository gradebookEntryRepository;
    private final AuditLogRepository auditLogRepository;
    private final NotificationRepository notificationRepository;
    private final MessageRepository messageRepository;
    private final org.springframework.jdbc.core.JdbcTemplate jdbcTemplate;

    @Override
    @Transactional
    public UserResponse createUser(UserRequest request) {
        if (request == null) {
            throw new ValidationException("User request cannot be null");
        }

        String rawRole = request.getRole() != null ? request.getRole().toUpperCase() : "STUDENT";
        if ("STAFF_ADMIN".equals(rawRole) || "SUPER_ADMIN".equals(rawRole)) {
            var auth = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
            boolean isSuperAdmin = auth != null && auth.getAuthorities().stream()
                    .anyMatch(a -> "ROLE_SUPER_ADMIN".equalsIgnoreCase(a.getAuthority()));
            if (!isSuperAdmin) {
                throw new org.springframework.security.access.AccessDeniedException("Only Super Administrator is authorized to create Administrator accounts.");
            }
        }

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new com.unilearn.server.exception.DuplicateEntryException("Email already registered: " + request.getEmail());
        }

        String passwordHash = passwordEncoder.encode(request.getPassword() != null ? request.getPassword() : "defaultPass123");
        User user = userMapper.toUser(request, passwordHash);
        User saved = userRepository.save(user);

        String roleName = saved.getRole() != null ? saved.getRole().toUpperCase() : "STUDENT";
        Department dept = null;
        if (request.getDepartmentId() != null) {
            dept = departmentRepository.findById(request.getDepartmentId())
                    .orElseThrow(() -> new EntryNotFoundException("Department not found with ID: " + request.getDepartmentId()));
        } else {
            dept = departmentRepository.findAll().stream().findFirst().orElse(null);
        }

        if ("STUDENT".equals(roleName)) {
            Batch batch = null;
            if (request.getBatchId() != null) {
                batch = batchRepository.findById(request.getBatchId())
                        .orElseThrow(() -> new EntryNotFoundException("Batch not found with ID: " + request.getBatchId()));
            } else {
                batch = batchRepository.findAll().stream().findFirst().orElse(null);
            }

            Student student = Student.builder()
                    .user(saved)
                    .studentNo("STU-" + saved.getUserId())
                    .department(dept)
                    .batch(batch)
                    .enrollmentYear(2026)
                    .build();
            studentRepository.save(student);
        } else if ("LECTURER".equals(roleName) || "GUEST_LECTURER".equals(roleName)) {
            Lecturer lecturer = Lecturer.builder()
                    .user(saved)
                    .department(dept)
                    .designation(request.getDesignation() != null ? request.getDesignation() : "Lecturer")
                    .isGuest("GUEST_LECTURER".equals(roleName))
                    .build();
            lecturerRepository.save(lecturer);
        } else if ("STAFF_ADMIN".equals(roleName) || "SUPER_ADMIN".equals(roleName)) {
            Faculty faculty = null;
            String scope = request.getScopeType() != null ? request.getScopeType().toUpperCase() : "INSTITUTION";
            if (request.getFacultyId() != null) {
                faculty = facultyRepository.findById(request.getFacultyId()).orElse(null);
                if (faculty != null) {
                    scope = "FACULTY";
                }
            } else if ("DEPARTMENT".equalsIgnoreCase(request.getScopeType()) && dept != null) {
                scope = "DEPARTMENT";
            }
            StaffAdmin staffAdmin = StaffAdmin.builder()
                    .user(saved)
                    .scopeLevel(scope)
                    .faculty(faculty)
                    .department("DEPARTMENT".equalsIgnoreCase(scope) ? dept : null)
                    .build();
            staffAdminRepository.save(staffAdmin);
        } else if ("HOD_DEAN".equals(roleName)) {
            Faculty faculty = null;
            if ("faculty".equalsIgnoreCase(request.getScopeType()) && request.getFacultyId() != null) {
                faculty = facultyRepository.findById(request.getFacultyId())
                        .orElseThrow(() -> new EntryNotFoundException("Faculty not found with ID: " + request.getFacultyId()));
            }
            HodDeanAssignment assignment = HodDeanAssignment.builder()
                .user(saved)
                .scopeType(request.getScopeType() != null ? request.getScopeType() : "department")
                .department("department".equalsIgnoreCase(request.getScopeType()) || request.getScopeType() == null ? dept : null)
                .faculty(faculty)
                .active(true)
                .build();
            hodDeanAssignmentRepository.save(assignment);
        }

        return enrichUserResponse(saved);
    }

    @Override
    @Transactional
    public UserResponse updateUser(Long userId, UserRequest request) {
        if (userId == null) {
            throw new ValidationException("User ID cannot be null");
        }
        if (request == null) {
            throw new ValidationException("User request cannot be null");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new EntryNotFoundException("User not found with ID: " + userId));

        if (!user.getEmail().equalsIgnoreCase(request.getEmail()) && userRepository.existsByEmail(request.getEmail())) {
            throw new com.unilearn.server.exception.DuplicateEntryException("Email already registered: " + request.getEmail());
        }

        user.setFullName(request.getFullName());
        user.setEmail(request.getEmail());
        user.setPhone(request.getPhone());
        user.setPhotoUrl(request.getPhotoUrl());
        if (request.getRole() != null) {
            String newRoleUpper = request.getRole().toUpperCase();
            if (("STAFF_ADMIN".equals(newRoleUpper) || "SUPER_ADMIN".equals(newRoleUpper))
                    && !newRoleUpper.equalsIgnoreCase(user.getRole())) {
                var auth = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
                boolean isSuperAdmin = auth != null && auth.getAuthorities().stream()
                        .anyMatch(a -> "ROLE_SUPER_ADMIN".equalsIgnoreCase(a.getAuthority()));
                if (!isSuperAdmin) {
                    throw new org.springframework.security.access.AccessDeniedException("Only Super Administrator is authorized to assign Administrator roles.");
                }
            }
            user.setRole(request.getRole().toLowerCase());
        }
        if (request.getStatus() != null) {
            user.setStatus(request.getStatus().toLowerCase());
        }
        if (request.getPassword() != null && !request.getPassword().isBlank()) {
            user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        }

        User updated = userRepository.save(user);
        return enrichUserResponse(updated);
    }

    @Override
    @Transactional
    public void deleteUser(Long userId) {
        if (userId == null) {
            throw new ValidationException("User ID cannot be null");
        }
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new EntryNotFoundException("User not found with ID: " + userId));

        String role = user.getRole() != null ? user.getRole().toLowerCase() : "";

        // Prevent deleting the Super Administrator or the sole administrator
        if ("super_admin".equalsIgnoreCase(role)) {
            throw new ValidationException("Cannot delete the Super Administrator account.");
        }
        if ("staff_admin".equalsIgnoreCase(role)) {
            long adminCount = userRepository.findAll().stream()
                    .filter(u -> "staff_admin".equalsIgnoreCase(u.getRole()) || "super_admin".equalsIgnoreCase(u.getRole()))
                    .count();
            if (adminCount <= 1) {
                throw new ValidationException("Cannot delete the only remaining system administrator account.");
            }
        }

        // Cascade-delete all related academic records before removing the user
        if ("student".equals(role)) {
            attendanceRecordRepository.deleteAll(attendanceRecordRepository.findByStudent_StudentId(userId));
            submissionRepository.deleteAll(submissionRepository.findByStudent_StudentId(userId));
            examAttemptRepository.deleteAll(examAttemptRepository.findByStudent_StudentId(userId));
            enrollmentRepository.deleteAll(enrollmentRepository.findByStudent_StudentId(userId));
            try {
                jdbcTemplate.update("DELETE FROM personal_resources WHERE student_id = ?", userId);
                jdbcTemplate.update("DELETE FROM ai_quiz_questions WHERE session_id IN (SELECT session_id FROM ai_quiz_sessions WHERE student_id = ?)", userId);
                jdbcTemplate.update("DELETE FROM ai_quiz_sessions WHERE student_id = ?", userId);
            } catch (Exception ignored) {}
            studentRepository.deleteById(userId);
        } else if ("lecturer".equals(role)) {
            List<com.unilearn.server.model.CourseOfferingLecturer> colList = courseOfferingLecturerRepository.findByLecturer_LecturerId(userId);
            for (com.unilearn.server.model.CourseOfferingLecturer col : colList) {
                gradebookEntryRepository.deleteAll(
                    gradebookEntryRepository.findByCourseOffering_OfferingId(col.getCourseOffering().getOfferingId())
                );
            }
            courseOfferingLecturerRepository.deleteAll(colList);
            assignmentRepository.deleteAll(assignmentRepository.findByCreatedBy_LecturerId(userId));
            materialRepository.deleteAll(materialRepository.findByUploadedBy_LecturerId(userId));
            lecturerRepository.deleteById(userId);
        } else if ("staff_admin".equals(role)) {
            staffAdminRepository.deleteById(userId);
        } else if ("hod_dean".equals(role)) {
            hodDeanAssignmentRepository.deleteAll(hodDeanAssignmentRepository.findByUser_UserId(userId));
        }

        // Unlink HOD or Dean role if assigned to department or faculty
        departmentRepository.findByHod_UserId(userId).ifPresent(d -> {
            d.setHod(null);
            departmentRepository.save(d);
        });
        facultyRepository.findByDean_UserId(userId).ifPresent(f -> {
            f.setDean(null);
            facultyRepository.save(f);
        });

        // Reassign historical parent references (exams, question banks, announcements) to fallback admin if possible
        Long fallbackAdminId = userRepository.findAll().stream()
                .filter(u -> ("super_admin".equalsIgnoreCase(u.getRole()) || "staff_admin".equalsIgnoreCase(u.getRole())) && !u.getUserId().equals(userId))
                .map(User::getUserId)
                .findFirst()
                .orElse(null);

        if (fallbackAdminId != null) {
            try {
                jdbcTemplate.update("UPDATE exams SET scheduled_by_user_id = ? WHERE scheduled_by_user_id = ?", fallbackAdminId, userId);
            } catch (Exception ignored) {}
            try {
                jdbcTemplate.update("UPDATE question_banks SET created_by = ? WHERE created_by = ?", fallbackAdminId, userId);
            } catch (Exception ignored) {}
            try {
                jdbcTemplate.update("UPDATE announcements SET posted_by = ? WHERE posted_by = ?", fallbackAdminId, userId);
            } catch (Exception ignored) {}
        }

        // Clean up user-level auxiliary records
        try {
            jdbcTemplate.update("DELETE FROM examiners WHERE examiner_id = ?", userId);
        } catch (Exception ignored) {}
        try {
            jdbcTemplate.update("DELETE FROM password_reset_tokens WHERE user_id = ?", userId);
        } catch (Exception ignored) {}
        try {
            jdbcTemplate.update("DELETE FROM forum_posts WHERE author_id = ?", userId);
        } catch (Exception ignored) {}
        try {
            jdbcTemplate.update("DELETE FROM ai_chat_messages WHERE session_id IN (SELECT session_id FROM ai_chat_sessions WHERE user_id = ?)", userId);
            jdbcTemplate.update("DELETE FROM ai_chat_sessions WHERE user_id = ?", userId);
        } catch (Exception ignored) {}

        // Delete audit logs, notifications and messages
        auditLogRepository.deleteAll(auditLogRepository.findByUser_UserId(userId));
        notificationRepository.deleteAll(notificationRepository.findByUser_UserId(userId));
        messageRepository.deleteAll(messageRepository.findBySender_UserIdOrReceiver_UserId(userId, userId));

        userRepository.delete(user);
    }

    @Override
    public UserResponse getUserById(Long userId) {
        if (userId == null) {
            throw new ValidationException("User ID cannot be null");
        }
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new EntryNotFoundException("User not found with ID: " + userId));
        return enrichUserResponse(user);
    }

    @Override
    public PageResponseDTO<UserResponse> getAllUsers(Pageable pageable) {
        if (pageable == null) {
            throw new ValidationException("Pageable parameter cannot be null");
        }
        Page<User> page = userRepository.findAll(pageable);
        List<UserResponse> content = page.getContent()
                .stream()
                .map(this::enrichUserResponse)
                .toList();

        return PageResponseDTO.<UserResponse>builder()
                .dataCount((int) page.getTotalElements())
                .dataList(content)
                .build();
    }

    @Override
    @Transactional
    public UserResponse setUserActive(Long userId, boolean active) {
        if (userId == null) {
            throw new ValidationException("User ID cannot be null");
        }
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new EntryNotFoundException("User not found with ID: " + userId));

        if (!active && "super_admin".equalsIgnoreCase(user.getRole())) {
            throw new ValidationException("Cannot deactivate the Super Administrator account.");
        }

        user.setStatus(active ? "active" : "inactive");
        User updated = userRepository.save(user);
        return enrichUserResponse(updated);
    }

    @Override
    @Transactional
    public UserResponse adminChangePassword(Long userId, String newPassword) {
        if (userId == null) {
            throw new ValidationException("User ID cannot be null");
        }
        if (newPassword == null || newPassword.isBlank()) {
            throw new ValidationException("New password cannot be empty");
        }
        if (newPassword.length() < 6) {
            throw new ValidationException("New password must be at least 6 characters");
        }
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new EntryNotFoundException("User not found with ID: " + userId));

        user.setPasswordHash(passwordEncoder.encode(newPassword.trim()));
        User updated = userRepository.save(user);
        return enrichUserResponse(updated);
    }

    private UserResponse enrichUserResponse(User user) {
        UserResponse resp = userMapper.toUserResponse(user);
        if (user.getRole() != null) {
            String roleUpper = user.getRole().toUpperCase();
            if ("STAFF_ADMIN".equals(roleUpper) || "SUPER_ADMIN".equals(roleUpper)) {
                staffAdminRepository.findById(user.getUserId()).ifPresent(sa -> {
                    resp.setScopeLevel(sa.getScopeLevel());
                    if (sa.getFaculty() != null) {
                        resp.setFacultyId(sa.getFaculty().getFacultyId());
                        resp.setFacultyName(sa.getFaculty().getName());
                    }
                    if (sa.getDepartment() != null) {
                        resp.setDepartmentId(sa.getDepartment().getDepartmentId());
                        resp.setDepartmentName(sa.getDepartment().getName());
                    }
                });
            } else if ("STUDENT".equals(roleUpper)) {
                studentRepository.findById(user.getUserId()).ifPresent(s -> {
                    if (s.getDepartment() != null) {
                        resp.setDepartmentId(s.getDepartment().getDepartmentId());
                        resp.setDepartmentName(s.getDepartment().getName());
                    }
                });
            } else if ("LECTURER".equals(roleUpper) || "GUEST_LECTURER".equals(roleUpper)) {
                lecturerRepository.findById(user.getUserId()).ifPresent(l -> {
                    if (l.getDepartment() != null) {
                        resp.setDepartmentId(l.getDepartment().getDepartmentId());
                        resp.setDepartmentName(l.getDepartment().getName());
                    }
                });
            }
        }
        return resp;
    }
}
