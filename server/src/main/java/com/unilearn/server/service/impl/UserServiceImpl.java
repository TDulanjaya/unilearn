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

    @Override
    @Transactional
    public UserResponse createUser(UserRequest request) {
        if (request == null) {
            throw new ValidationException("User request cannot be null");
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
        } else if ("STAFF_ADMIN".equals(roleName)) {
            StaffAdmin staffAdmin = StaffAdmin.builder()
                    .user(saved)
                    .scopeLevel("INSTITUTION")
                    .department(dept)
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

        return userMapper.toUserResponse(saved);
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
            user.setRole(request.getRole().toLowerCase());
        }
        if (request.getStatus() != null) {
            user.setStatus(request.getStatus().toLowerCase());
        }
        if (request.getPassword() != null && !request.getPassword().isBlank()) {
            user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        }

        User updated = userRepository.save(user);
        return userMapper.toUserResponse(updated);
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
        boolean hasAcademicData = false;

        if ("student".equals(role)) {
            if (!enrollmentRepository.findByStudent_StudentId(userId).isEmpty() ||
                !submissionRepository.findByStudent_StudentId(userId).isEmpty() ||
                !examAttemptRepository.findByStudent_StudentId(userId).isEmpty() ||
                !attendanceRecordRepository.findByStudent_StudentId(userId).isEmpty()) {
                hasAcademicData = true;
            }
        } else if ("lecturer".equals(role)) {
            List<com.unilearn.server.model.CourseOfferingLecturer> colList = courseOfferingLecturerRepository.findByLecturer_LecturerId(userId);
            if (!colList.isEmpty() ||
                !assignmentRepository.findByCreatedBy_LecturerId(userId).isEmpty() ||
                !materialRepository.findByUploadedBy_LecturerId(userId).isEmpty()) {
                hasAcademicData = true;
            }
            if (!hasAcademicData && !colList.isEmpty()) {
                for (com.unilearn.server.model.CourseOfferingLecturer col : colList) {
                    if (!gradebookEntryRepository.findByCourseOffering_OfferingId(col.getCourseOffering().getOfferingId()).isEmpty()) {
                        hasAcademicData = true;
                        break;
                    }
                }
            }
        } else if ("hod_dean".equals(role) || "staff_admin".equals(role)) {
            if (!hodDeanAssignmentRepository.findByUser_UserId(userId).isEmpty() ||
                !auditLogRepository.findByUser_UserId(userId).isEmpty()) {
                hasAcademicData = true;
            }
        }

        if (hasAcademicData) {
            throw new com.unilearn.server.exception.IllegalStateException(
                "Cannot permanently delete a user with existing academic records. Deactivate the account instead."
            );
        }

        // Genueinely unused account path - perform deletion
        if ("student".equals(role)) {
            studentRepository.deleteById(userId);
        } else if ("lecturer".equals(role)) {
            lecturerRepository.deleteById(userId);
        } else if ("staff_admin".equals(role)) {
            staffAdminRepository.deleteById(userId);
        } else if ("hod_dean".equals(role)) {
            hodDeanAssignmentRepository.deleteAll(hodDeanAssignmentRepository.findByUser_UserId(userId));
        }

        // Delete user's notifications and messages
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
        return userMapper.toUserResponse(user);
    }

    @Override
    public PageResponseDTO<UserResponse> getAllUsers(Pageable pageable) {
        if (pageable == null) {
            throw new ValidationException("Pageable parameter cannot be null");
        }
        Page<User> page = userRepository.findAll(pageable);
        List<UserResponse> content = page.getContent()
                .stream()
                .map(userMapper::toUserResponse)
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

        user.setStatus(active ? "active" : "inactive");
        User updated = userRepository.save(user);
        return userMapper.toUserResponse(updated);
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
        return userMapper.toUserResponse(updated);
    }
}
