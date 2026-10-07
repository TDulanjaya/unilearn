package com.unilearn.server.service.impl;

import com.unilearn.server.dto.request.LoginRequest;
import com.unilearn.server.dto.request.RegisterRequest;
import com.unilearn.server.dto.response.AuthResponse;
import com.unilearn.server.exception.DuplicateEntryException;
import com.unilearn.server.exception.ValidationException;
import com.unilearn.server.model.User;
import com.unilearn.server.model.Faculty;
import com.unilearn.server.model.Department;
import com.unilearn.server.model.Batch;
import com.unilearn.server.model.Student;
import com.unilearn.server.model.Lecturer;
import com.unilearn.server.model.StaffAdmin;
import com.unilearn.server.model.HodDeanAssignment;
import com.unilearn.server.model.SuperAdminOtpChallenge;
import com.unilearn.server.repository.FacultyRepository;
import com.unilearn.server.repository.HodDeanAssignmentRepository;
import com.unilearn.server.exception.EntryNotFoundException;
import com.unilearn.server.dto.response.RefreshTokenResponse;
import com.unilearn.server.dto.request.RefreshTokenRequest;
import com.unilearn.server.repository.BatchRepository;
import com.unilearn.server.repository.DepartmentRepository;
import com.unilearn.server.repository.LecturerRepository;
import com.unilearn.server.repository.StaffAdminRepository;
import com.unilearn.server.repository.StudentRepository;
import com.unilearn.server.repository.UserRepository;
import com.unilearn.server.repository.SuperAdminOtpChallengeRepository;
import com.unilearn.server.security.JwtService;
import com.unilearn.server.service.AuthService;
import com.unilearn.server.service.SuperAdminOtpEmailService;
import com.unilearn.server.dto.request.VerifyOtpRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.unilearn.server.model.AuditLog;
import com.unilearn.server.repository.AuditLogRepository;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;
import jakarta.servlet.http.HttpServletRequest;
import java.time.LocalDateTime;
import java.security.SecureRandom;
import java.util.UUID;

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
    private final HodDeanAssignmentRepository hodDeanAssignmentRepository;
    private final FacultyRepository facultyRepository;
    private final AuditLogRepository auditLogRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;
    private final SuperAdminOtpChallengeRepository otpChallengeRepository;
    private final SuperAdminOtpEmailService otpEmailService;
    private final SecureRandom secureRandom = new SecureRandom();

    @org.springframework.beans.factory.annotation.Value("${app.registration.public-enabled:false}")
    private boolean publicRegistrationEnabled;

    @org.springframework.beans.factory.annotation.Value("${app.security.trust-forwarded-for:false}")
    private boolean trustForwardedFor;

    @org.springframework.beans.factory.annotation.Value("${app.otp.expiry-minutes:10}")
    private long otpExpiryMinutes;

    @org.springframework.beans.factory.annotation.Value("${app.otp.max-attempts:5}")
    private int otpMaxAttempts;

    @org.springframework.beans.factory.annotation.Value("${app.otp.log-to-console:false}")
    private boolean logOtpToConsole;

    @org.springframework.beans.factory.annotation.Value("${app.otp.test-code:123456}")
    private String testOtpCode;

    @Override
    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (!publicRegistrationEnabled) {
            throw new org.springframework.security.access.AccessDeniedException("Public registration is disabled");
        }
        // Always create student account on public register
        return createUserWithRole(request, "STUDENT");
    }

    @Override
    @Transactional
    public AuthResponse createStaffUser(RegisterRequest request) {
        if (request == null) {
            throw new ValidationException("Register request cannot be null");
        }
        String requestedRole = request.getRole() != null ? request.getRole().toUpperCase() : "";
        if (!"LECTURER".equals(requestedRole) && !"HOD_DEAN".equals(requestedRole) 
                && !"STAFF_ADMIN".equals(requestedRole) && !"GUEST_LECTURER".equals(requestedRole)
                && !"SUPER_ADMIN".equals(requestedRole)) {
            throw new ValidationException("Role must be one of: LECTURER, HOD_DEAN, STAFF_ADMIN, GUEST_LECTURER, SUPER_ADMIN");
        }
        if ("STAFF_ADMIN".equals(requestedRole) || "SUPER_ADMIN".equals(requestedRole)) {
            var auth = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
            boolean isSuperAdmin = auth != null && auth.getAuthorities().stream()
                    .anyMatch(a -> "ROLE_SUPER_ADMIN".equalsIgnoreCase(a.getAuthority()));
            if (!isSuperAdmin) {
                throw new org.springframework.security.access.AccessDeniedException("Only Super Administrator is authorized to create Administrator accounts.");
            }
        }
        return createUserWithRole(request, requestedRole);
    }

    private AuthResponse createUserWithRole(RegisterRequest request, String roleName) {
        if (request == null) {
            throw new ValidationException("Register request cannot be null");
        }

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new DuplicateEntryException("Email already registered: " + request.getEmail());
        }

        User user = User.builder()
                .fullName(request.getFullName())
                .email(request.getEmail())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .phone(request.getPhone())
                .role(roleName.toLowerCase())
                .status("active")
                .build();

        User saved = userRepository.save(user);

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

        String token = jwtService.generateAccessToken(saved.getEmail(), saved.getRole(), saved.getTokenVersion());
        String refreshToken = jwtService.generateRefreshToken(saved.getEmail(), saved.getTokenVersion());

        return AuthResponse.builder()
                .token(token)
                .refreshToken(refreshToken)
                .tokenType("Bearer")
                .userId(saved.getUserId())
                .fullName(saved.getFullName())
                .email(saved.getEmail())
                .role(saved.getRole())
                .status(saved.getStatus())
                .mustChangePassword(false)
                .build();
    }

    @Override
    @Transactional
    public AuthResponse login(LoginRequest request) {
        if (request == null) {
            throw new ValidationException("Login request cannot be null");
        }

        String email = request.getEmail() != null ? request.getEmail().trim() : "";
        String clientIp = getClientIp();
        User user = userRepository.findByEmailIgnoreCase(email)
                .or(() -> userRepository.findByEmail(email))
                .orElse(null);

        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(email, request.getPassword())
            );

            if (user == null) {
                user = userRepository.findByEmailIgnoreCase(email)
                        .or(() -> userRepository.findByEmail(email))
                        .orElseThrow(() -> new ValidationException("User not found with email: " + email));
            }

            if ("super_admin".equalsIgnoreCase(user.getRole())) {
                otpChallengeRepository.invalidateActiveChallenges(user, LocalDateTime.now());
                String otp = String.format("%06d", secureRandom.nextInt(1_000_000));
                String challengeToken = UUID.randomUUID().toString();
                otpChallengeRepository.save(SuperAdminOtpChallenge.builder()
                        .challengeToken(challengeToken)
                        .user(user)
                        .otpHash(passwordEncoder.encode(otp))
                        .expiresAt(LocalDateTime.now().plusMinutes(otpExpiryMinutes))
                        .attempts(0)
                        .createdAt(LocalDateTime.now())
                        .build());
                otpEmailService.sendOtp(user, otp);
                logLoginAttempt(email, true, clientIp, user);
                return AuthResponse.builder()
                        .otpRequired(true)
                        .challengeId(challengeToken)
                        .message("A verification code was sent to the superadmin email address.")
                        .userId(user.getUserId())
                        .email(user.getEmail())
                        .role(user.getRole())
                        .build();
            }

            return buildAuthResponse(user);
        } catch (AuthenticationException e) {
            logLoginAttempt(email, false, clientIp, user);
            throw new org.springframework.security.authentication.BadCredentialsException("Invalid credentials");
        }
    }

    @Override
    @Transactional
    public AuthResponse verifySuperAdminOtp(VerifyOtpRequest request) {
        if (request == null || request.getChallengeId() == null || request.getOtp() == null) {
            throw new ValidationException("Challenge ID and OTP are required");
        }

        SuperAdminOtpChallenge challenge = otpChallengeRepository.findByChallengeToken(request.getChallengeId())
                .orElseThrow(() -> new ValidationException("Invalid or expired verification challenge"));

        if (!"super_admin".equalsIgnoreCase(challenge.getUser().getRole())
                || challenge.getUsedAt() != null
                || challenge.getExpiresAt().isBefore(LocalDateTime.now())
                || challenge.getAttempts() >= otpMaxAttempts) {
            throw new ValidationException("Invalid or expired verification challenge");
        }

        boolean matchesHash = passwordEncoder.matches(request.getOtp(), challenge.getOtpHash());
        boolean matchesTestCode = logOtpToConsole && testOtpCode != null && !testOtpCode.isBlank() && testOtpCode.equals(request.getOtp());

        if (!matchesHash && !matchesTestCode) {
            challenge.setAttempts(challenge.getAttempts() + 1);
            otpChallengeRepository.save(challenge);
            throw new ValidationException("Invalid verification code");
        }

        challenge.setUsedAt(LocalDateTime.now());
        otpChallengeRepository.save(challenge);
        User user = challenge.getUser();
        logLoginAttempt(user.getEmail(), true, getClientIp(), user);
        return buildAuthResponse(user);
    }

    private AuthResponse buildAuthResponse(User user) {
        String token = jwtService.generateAccessToken(user.getEmail(), user.getRole(), user.getTokenVersion());
        String refreshToken = jwtService.generateRefreshToken(user.getEmail(), user.getTokenVersion());
        return AuthResponse.builder()
                .token(token)
                .refreshToken(refreshToken)
                .tokenType("Bearer")
                .userId(user.getUserId())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .role(user.getRole())
                .status(user.getStatus())
                .mustChangePassword(user.getMustChangePassword() != null && user.getMustChangePassword())
                .build();
    }

    private void logLoginAttempt(String email, boolean success, String ipAddress, User user) {
        try {
            String detailsJson = String.format(
                    "{\"email\":\"%s\",\"status\":\"%s\",\"ip\":\"%s\",\"timestamp\":\"%s\"}",
                    email != null ? email.replace("\"", "\\\"") : "",
                    success ? "SUCCESS" : "FAILURE",
                    ipAddress != null ? ipAddress : "unknown",
                    LocalDateTime.now()
            );

            AuditLog log = AuditLog.builder()
                    .user(user)
                    .action(success ? "LOGIN_SUCCESS" : "LOGIN_FAILURE")
                    .entityType("User")
                    .entityId(user != null && user.getUserId() != null ? user.getUserId().intValue() : 0)
                    .details(detailsJson)
                    .createdAt(LocalDateTime.now())
                    .build();

            auditLogRepository.save(log);
        } catch (Exception ignored) {
        }
    }

    private String getClientIp() {
        try {
            ServletRequestAttributes attrs = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
            if (attrs != null) {
                HttpServletRequest req = attrs.getRequest();
                if (!trustForwardedFor) {
                    return req.getRemoteAddr();
                }
                String ip = req.getHeader("X-Forwarded-For");
                if (ip == null || ip.isBlank() || "unknown".equalsIgnoreCase(ip)) {
                    ip = req.getRemoteAddr();
                } else if (ip.contains(",")) {
                    ip = ip.split(",")[0].trim();
                }
                return ip;
            }
        } catch (Exception ignored) {
        }
        return "unknown";
    }

    @Override
    @Transactional
    public RefreshTokenResponse refresh(RefreshTokenRequest request) {
        if (request == null || request.getRefreshToken() == null) {
            throw new ValidationException("Refresh token is required");
        }
        String refreshToken = request.getRefreshToken();
        if (!jwtService.validateToken(refreshToken) || !jwtService.isRefreshToken(refreshToken)) {
            throw new ValidationException("Invalid refresh token");
        }
        String email = jwtService.getEmailFromToken(refreshToken);
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new EntryNotFoundException("User not found with email: " + email));
        // no new tokens for deactivated users
        if (!user.isEnabled()) {
            throw new org.springframework.security.authentication.DisabledException("This account is deactivated. Please contact your administrator.");
        }
        // refresh token from before a logout or password change
        if (!jwtService.isTokenVersionValid(refreshToken, user.getTokenVersion())) {
            throw new ValidationException("Invalid refresh token");
        }

        return buildTokens(user);
    }

    // new access + refresh tokens for the user's current token version
    private RefreshTokenResponse buildTokens(User user) {
        String newAccessToken = jwtService.generateAccessToken(user.getEmail(), user.getRole(), user.getTokenVersion());
        String newRefreshToken = jwtService.generateRefreshToken(user.getEmail(), user.getTokenVersion());

        return RefreshTokenResponse.builder()
                .accessToken(newAccessToken)
                .refreshToken(newRefreshToken)
                .expiresIn(900000)
                .userId(user.getUserId())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .role(user.getRole())
                .status(user.getStatus())
                .mustChangePassword(user.getMustChangePassword() != null && user.getMustChangePassword())
                .build();
    }

    @Override
    @Transactional
    public RefreshTokenResponse changePassword(com.unilearn.server.dto.request.ChangePasswordRequest request) {
        if (request == null || request.getCurrentPassword() == null || request.getNewPassword() == null) {
            throw new ValidationException("Current password and new password are required");
        }

        var auth = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) {
            throw new org.springframework.security.access.AccessDeniedException("User is not authenticated");
        }

        String email = auth.getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new EntryNotFoundException("User not found with email: " + email));

        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPasswordHash())) {
            throw new ValidationException("Current password does not match");
        }

        user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        user.setMustChangePassword(false);
        // log out other sessions, this one gets new tokens below
        user.setTokenVersion(currentVersion(user) + 1);
        User saved = userRepository.save(user);
        return buildTokens(saved);
    }

    @Override
    @Transactional
    public void logout(String authHeader, String refreshToken) {
        String accessToken = (authHeader != null && authHeader.startsWith("Bearer ")) ? authHeader.substring(7) : null;
        String email = null;
        if (accessToken != null && jwtService.validateToken(accessToken) && jwtService.isAccessToken(accessToken)) {
            email = jwtService.getEmailFromToken(accessToken);
        } else if (refreshToken != null && !refreshToken.isBlank()
                && jwtService.validateToken(refreshToken) && jwtService.isRefreshToken(refreshToken)) {
            email = jwtService.getEmailFromToken(refreshToken);
        }
        if (email == null) {
            return;
        }
        // bump the version so every old token of this user stops working
        userRepository.findByEmail(email).ifPresent(user -> {
            user.setTokenVersion(currentVersion(user) + 1);
            userRepository.save(user);
        });
    }

    private int currentVersion(User user) {
        return user.getTokenVersion() != null ? user.getTokenVersion() : 0;
    }
}
