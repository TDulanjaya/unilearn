package com.unilearn.server.service.impl;

import com.unilearn.server.dto.request.UserRequest;
import com.unilearn.server.dto.response.PageResponseDTO;
import com.unilearn.server.dto.response.UserResponse;
import com.unilearn.server.exception.EntryNotFoundException;
import com.unilearn.server.exception.ValidationException;
import com.unilearn.server.model.User;
import com.unilearn.server.repository.BatchRepository;
import com.unilearn.server.repository.DepartmentRepository;
import com.unilearn.server.repository.LecturerRepository;
import com.unilearn.server.repository.StaffAdminRepository;
import com.unilearn.server.repository.StudentRepository;
import com.unilearn.server.repository.UserRepository;
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
    private final UserMapper userMapper;
    private final PasswordEncoder passwordEncoder;

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
        var defaultDept = departmentRepository.findAll().stream().findFirst().orElse(null);
        var defaultBatch = batchRepository.findAll().stream().findFirst().orElse(null);

        if ("STUDENT".equals(roleName)) {
            com.unilearn.server.model.Student student = com.unilearn.server.model.Student.builder()
                    .user(saved)
                    .studentNo("STU-" + saved.getUserId())
                    .department(defaultDept)
                    .batch(defaultBatch)
                    .enrollmentYear(2026)
                    .feeStatus("active")
                    .build();
            studentRepository.save(student);
        } else if ("LECTURER".equals(roleName) || "GUEST_LECTURER".equals(roleName)) {
            com.unilearn.server.model.Lecturer lecturer = com.unilearn.server.model.Lecturer.builder()
                    .user(saved)
                    .department(defaultDept)
                    .designation("Lecturer")
                    .isGuest("GUEST_LECTURER".equals(roleName))
                    .build();
            lecturerRepository.save(lecturer);
        } else if ("STAFF_ADMIN".equals(roleName)) {
            com.unilearn.server.model.StaffAdmin staffAdmin = com.unilearn.server.model.StaffAdmin.builder()
                    .user(saved)
                    .scopeLevel("INSTITUTION")
                    .department(defaultDept)
                    .build();
            staffAdminRepository.save(staffAdmin);
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
}
