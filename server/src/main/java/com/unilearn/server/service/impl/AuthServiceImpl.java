package com.unilearn.server.service.impl;

import com.unilearn.server.dto.request.LoginRequest;
import com.unilearn.server.dto.request.RegisterRequest;
import com.unilearn.server.dto.response.AuthResponse;
import com.unilearn.server.exception.DuplicateEntryException;
import com.unilearn.server.exception.ValidationException;
import com.unilearn.server.model.User;
import com.unilearn.server.repository.BatchRepository;
import com.unilearn.server.repository.DepartmentRepository;
import com.unilearn.server.repository.LecturerRepository;
import com.unilearn.server.repository.StaffAdminRepository;
import com.unilearn.server.repository.StudentRepository;
import com.unilearn.server.repository.UserRepository;
import com.unilearn.server.security.JwtService;
import com.unilearn.server.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final StudentRepository studentRepository;
    private final LecturerRepository lecturerRepository;
    private final StaffAdminRepository staffAdminRepository;
    private final DepartmentRepository departmentRepository;
    private final BatchRepository batchRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

    @Override
    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (request == null) {
            throw new ValidationException("Register request cannot be null");
        }

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new DuplicateEntryException("Email already registered: " + request.getEmail());
        }

        String roleName = request.getRole() != null ? request.getRole().toUpperCase() : "STUDENT";

        User user = User.builder()
                .fullName(request.getFullName())
                .email(request.getEmail())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .phone(request.getPhone())
                .role(roleName.toLowerCase())
                .status("active")
                .build();

        User saved = userRepository.save(user);

        // Fetch or fallback default Department & Batch
        var defaultDept = departmentRepository.findAll().stream().findFirst().orElse(null);
        var defaultBatch = batchRepository.findAll().stream().findFirst().orElse(null);

        var dept = request.getDepartmentId() != null
                ? departmentRepository.findById(request.getDepartmentId()).orElse(defaultDept)
                : defaultDept;

        var batch = request.getBatchId() != null
                ? batchRepository.findById(request.getBatchId()).orElse(defaultBatch)
                : defaultBatch;

        if ("STUDENT".equals(roleName)) {
            String sNo = "STU-" + saved.getUserId();
            com.unilearn.server.model.Student student = com.unilearn.server.model.Student.builder()
                    .user(saved)
                    .studentNo(sNo)
                    .department(dept)
                    .batch(batch)
                    .enrollmentYear(2026)
                    .feeStatus("active")
                    .build();
            studentRepository.save(student);
        } else if ("LECTURER".equals(roleName) || "GUEST_LECTURER".equals(roleName)) {
            com.unilearn.server.model.Lecturer lecturer = com.unilearn.server.model.Lecturer.builder()
                    .user(saved)
                    .department(dept)
                    .designation(request.getDesignation() != null ? request.getDesignation() : "Lecturer")
                    .isGuest("GUEST_LECTURER".equals(roleName))
                    .build();
            lecturerRepository.save(lecturer);
        } else if ("STAFF_ADMIN".equals(roleName)) {
            com.unilearn.server.model.StaffAdmin staffAdmin = com.unilearn.server.model.StaffAdmin.builder()
                    .user(saved)
                    .scopeLevel("INSTITUTION")
                    .department(dept)
                    .build();
            staffAdminRepository.save(staffAdmin);
        }

        String token = jwtService.generateAccessToken(saved.getEmail(), saved.getRole());

        return AuthResponse.builder()
                .token(token)
                .tokenType("Bearer")
                .userId(saved.getUserId())
                .fullName(saved.getFullName())
                .email(saved.getEmail())
                .role(saved.getRole())
                .status(saved.getStatus())
                .build();
    }

    @Override
    @Transactional
    public AuthResponse login(LoginRequest request) {
        if (request == null) {
            throw new ValidationException("Login request cannot be null");
        }

        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
            );
        } catch (AuthenticationException e) {
            throw new ValidationException("Invalid credentials");
        }

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new ValidationException("User not found with email: " + request.getEmail()));

        String token = jwtService.generateAccessToken(user.getEmail(), user.getRole());

        return AuthResponse.builder()
                .token(token)
                .tokenType("Bearer")
                .userId(user.getUserId())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .role(user.getRole())
                .status(user.getStatus())
                .build();
    }
}
