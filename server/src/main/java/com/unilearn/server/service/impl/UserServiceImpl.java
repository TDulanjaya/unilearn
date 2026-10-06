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

import java.util.ArrayList;
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
    private final CourseOfferingRepository courseOfferingRepository;
    private final QuestionBankRepository questionBankRepository;
    private final AssignmentRepository assignmentRepository;
    private final MaterialRepository materialRepository;
    private final GradebookEntryRepository gradebookEntryRepository;
    private final AuditLogRepository auditLogRepository;
    private final NotificationRepository notificationRepository;
    private final MessageRepository messageRepository;
    private final org.springframework.jdbc.core.JdbcTemplate jdbcTemplate;

    private static final String UPPER = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    private static final String LOWER = "abcdefghijklmnopqrstuvwxyz";
    private static final String DIGITS = "0123456789";
    private static final String SPECIAL = "@#$!%*?&";
    private static final String ALL_CHARS = UPPER + LOWER + DIGITS + SPECIAL;
    private static final java.security.SecureRandom SECURE_RANDOM = new java.security.SecureRandom();

    public static String generateSecureTemporaryPassword() {
        StringBuilder sb = new StringBuilder(16);
        sb.append(UPPER.charAt(SECURE_RANDOM.nextInt(UPPER.length())));
        sb.append(LOWER.charAt(SECURE_RANDOM.nextInt(LOWER.length())));
        sb.append(DIGITS.charAt(SECURE_RANDOM.nextInt(DIGITS.length())));
        sb.append(SPECIAL.charAt(SECURE_RANDOM.nextInt(SPECIAL.length())));
        for (int i = 4; i < 16; i++) {
            sb.append(ALL_CHARS.charAt(SECURE_RANDOM.nextInt(ALL_CHARS.length())));
        }
        char[] chars = sb.toString().toCharArray();
        for (int i = chars.length - 1; i > 0; i--) {
            int j = SECURE_RANDOM.nextInt(i + 1);
            char temp = chars[i];
            chars[i] = chars[j];
            chars[j] = temp;
        }
        return new String(chars);
    }

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

        boolean mustChange = false;
        String rawPassword = request.getPassword();
        if (rawPassword == null || rawPassword.trim().isEmpty()) {
            rawPassword = generateSecureTemporaryPassword();
            mustChange = true;
        }
        String passwordHash = passwordEncoder.encode(rawPassword.trim());
        User user = userMapper.toUser(request, passwordHash);
        user.setMustChangePassword(mustChange);
        User saved = userRepository.save(user);

        String roleName = saved.getRole() != null ? saved.getRole().toUpperCase() : "STUDENT";
        Department dept = null;
        if (request.getDepartmentId() != null) {
            dept = departmentRepository.findById(request.getDepartmentId())
                    .orElseThrow(() -> new EntryNotFoundException("Department not found with ID: " + request.getDepartmentId()));
        } else if (!"STUDENT".equals(roleName)) {
            dept = departmentRepository.findAll().stream().findFirst().orElse(null);
        }

        if ("STUDENT".equals(roleName)) {
            if (request.getDepartmentId() == null) {
                throw new ValidationException("Department is required when creating a student account");
            }
            if (request.getBatchId() == null) {
                throw new ValidationException("Batch is required when creating a student account");
            }

            Batch batch = batchRepository.findById(request.getBatchId())
                    .orElseThrow(() -> new EntryNotFoundException("Batch not found with ID: " + request.getBatchId()));

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

        UserResponse response = enrichUserResponse(saved);
        response.setTemporaryPassword(rawPassword);
        return response;
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

        checkSuperAdminModification(user);

        if (!user.getEmail().equalsIgnoreCase(request.getEmail()) && userRepository.existsByEmail(request.getEmail())) {
            throw new com.unilearn.server.exception.DuplicateEntryException("Email already registered: " + request.getEmail());
        }

        // the student/lecturer/admin rows are not moved, so a role change would leave the user half done
        if (request.getRole() != null && !request.getRole().equalsIgnoreCase(user.getRole())) {
            throw new ValidationException("Changing a user's role isn't supported. Create a new account instead.");
        }

        user.setFullName(request.getFullName());
        user.setEmail(request.getEmail());
        user.setPhone(request.getPhone());
        user.setPhotoUrl(request.getPhotoUrl());
        if (request.getStatus() != null) {
            String newStatus = request.getStatus().toLowerCase();
            // log the user out everywhere when the account is turned off
            if (!"active".equals(newStatus) && "active".equalsIgnoreCase(user.getStatus())) {
                if ("super_admin".equalsIgnoreCase(user.getRole())) {
                    throw new ValidationException("Cannot deactivate the Super Administrator account.");
                }
                bumpTokenVersion(user);
            }
            user.setStatus(newStatus);
        }
        if (request.getPassword() != null && !request.getPassword().isBlank()) {
            user.setPasswordHash(passwordEncoder.encode(request.getPassword().trim()));
            user.setMustChangePassword(true);
            bumpTokenVersion(user);
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

        // Do not delete super admin or last admin
        if ("super_admin".equalsIgnoreCase(role)) {
            var auth = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
            boolean isSuperAdmin = auth != null && auth.getAuthorities().stream()
                    .anyMatch(a -> "ROLE_SUPER_ADMIN".equalsIgnoreCase(a.getAuthority()));
            if (!isSuperAdmin) {
                throw new org.springframework.security.access.AccessDeniedException("Staff Admin is not authorized to delete a Super Administrator account.");
            }
            long superAdminCount = userRepository.findAll().stream()
                    .filter(u -> "super_admin".equalsIgnoreCase(u.getRole()))
                    .count();
            if (superAdminCount <= 1) {
                throw new ValidationException("Cannot delete the last Super Administrator account.");
            }
        }
        if ("staff_admin".equalsIgnoreCase(role)) {
            long adminCount = userRepository.findAll().stream()
                    .filter(u -> "staff_admin".equalsIgnoreCase(u.getRole()) || "super_admin".equalsIgnoreCase(u.getRole()))
                    .count();
            if (adminCount <= 1) {
                throw new ValidationException("Cannot delete the only remaining system administrator account.");
            }
        }

        // Delete related academic records first
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
        } else if ("lecturer".equals(role) || "guest_lecturer".equals(role)) {
            // never delete other people's gradebook or submissions here
            checkLecturerCanBeDeleted(userId);
            if (lecturerRepository.existsById(userId)) {
                lecturerRepository.deleteById(userId);
            }
        } else if ("staff_admin".equals(role)) {
            staffAdminRepository.deleteById(userId);
        } else if ("hod_dean".equals(role)) {
            hodDeanAssignmentRepository.deleteAll(hodDeanAssignmentRepository.findByUser_UserId(userId));
        }

        // Unlink HOD or Dean role
        departmentRepository.findByHod_UserId(userId).ifPresent(d -> {
            d.setHod(null);
            departmentRepository.save(d);
        });
        facultyRepository.findByDean_UserId(userId).ifPresent(f -> {
            f.setDean(null);
            facultyRepository.save(f);
        });

        // Reassign exams, banks, and announcements to admin
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

        // Delete user auxiliary records
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

        // Delete logs, notifications, and messages
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
    public PageResponseDTO<UserResponse> getAllUsers(Pageable pageable, String search, String roles, String status) {
        if (pageable == null) {
            throw new ValidationException("Pageable parameter cannot be null");
        }
        String searchText = (search == null || search.isBlank()) ? "" : "%" + search.trim().toLowerCase() + "%";
        List<String> roleList = new ArrayList<>();
        if (roles != null) {
            for (String r : roles.split(",")) {
                if (!r.isBlank()) {
                    roleList.add(r.trim().toLowerCase());
                }
            }
        }
        boolean allRoles = roleList.isEmpty();
        if (allRoles) {
            // IN with an empty list is not valid sql
            roleList.add("-");
        }
        String statusText = status == null ? "" : status.trim().toLowerCase();
        if (!statusText.isEmpty() && !"active".equals(statusText) && !"inactive".equals(statusText)) {
            throw new ValidationException("Status filter must be active or inactive");
        }
        Page<User> page = userRepository.searchUsers(searchText, allRoles, roleList, statusText, pageable);
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

        checkSuperAdminModification(user);

        if (!active && "super_admin".equalsIgnoreCase(user.getRole())) {
            throw new ValidationException("Cannot deactivate the Super Administrator account.");
        }

        if (!active) {
            // old tokens stop working
            bumpTokenVersion(user);
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

        checkSuperAdminModification(user);

        user.setPasswordHash(passwordEncoder.encode(newPassword.trim()));
        user.setMustChangePassword(true);
        // sign the user out of old sessions
        bumpTokenVersion(user);
        User updated = userRepository.save(user);
        return enrichUserResponse(updated);
    }

    private void bumpTokenVersion(User user) {
        int current = user.getTokenVersion() != null ? user.getTokenVersion() : 0;
        user.setTokenVersion(current + 1);
    }

    // lecturers with teaching records are kept, the admin should deactivate them
    private void checkLecturerCanBeDeleted(Long userId) {
        List<String> reasons = new ArrayList<>();
        int primaryCount = courseOfferingRepository.findByPrimaryLecturer_LecturerId(userId).size();
        if (primaryCount > 0) {
            reasons.add("main lecturer of " + primaryCount + " course offering(s)");
        }
        int coCount = courseOfferingLecturerRepository.findByLecturer_LecturerId(userId).size();
        if (coCount > 0) {
            reasons.add("assigned to " + coCount + " course offering(s)");
        }
        int assignmentCount = assignmentRepository.findByCreatedBy_LecturerId(userId).size();
        if (assignmentCount > 0) {
            reasons.add("owner of " + assignmentCount + " assignment(s)");
        }
        int materialCount = materialRepository.findByUploadedBy_LecturerId(userId).size();
        if (materialCount > 0) {
            reasons.add("uploader of " + materialCount + " material(s)");
        }
        Long examCount = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM exams WHERE scheduled_by_user_id = ?", Long.class, userId);
        if (examCount != null && examCount > 0) {
            reasons.add("owner of " + examCount + " exam(s)");
        }
        int bankCount = questionBankRepository.findByCreatedBy_UserId(userId).size();
        if (bankCount > 0) {
            reasons.add("owner of " + bankCount + " question bank(s)");
        }
        if (!reasons.isEmpty()) {
            throw new com.unilearn.server.exception.IllegalStateException(
                    "This lecturer can't be deleted because they are " + String.join(", ", reasons)
                            + ". Deactivate the account instead to keep the academic records.");
        }
    }

    private void checkSuperAdminModification(User targetUser) {
        if ("super_admin".equalsIgnoreCase(targetUser.getRole())) {
            var auth = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
            boolean isSuperAdmin = auth != null && auth.getAuthorities().stream()
                    .anyMatch(a -> "ROLE_SUPER_ADMIN".equalsIgnoreCase(a.getAuthority()));
            if (!isSuperAdmin) {
                throw new org.springframework.security.access.AccessDeniedException("Staff Admin is not authorized to modify a Super Administrator account.");
            }
        }
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
