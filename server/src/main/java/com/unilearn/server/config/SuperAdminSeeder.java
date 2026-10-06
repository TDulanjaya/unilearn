package com.unilearn.server.config;

import com.unilearn.server.model.StaffAdmin;
import com.unilearn.server.model.User;
import com.unilearn.server.repository.StaffAdminRepository;
import com.unilearn.server.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;

@Slf4j
@Component
@RequiredArgsConstructor
public class SuperAdminSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final StaffAdminRepository staffAdminRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.superadmin.name:}")
    private String adminName;

    @Value("${app.superadmin.email:}")
    private String adminEmail;

    @Value("${app.superadmin.password:}")
    private String adminPassword;

    @Value("${app.superadmin.phone:}")
    private String adminPhone;

    @Value("${app.superadmin.force-reset:}")
    private String forceReset;

    @Value("${app.superadmin.bootstrap-enabled:false}")
    private boolean bootstrapEnabled;

    @Override
    @Transactional
    public void run(String... args) {
        if (!bootstrapEnabled) {
            log.info("Super admin bootstrap is disabled; using the database super admin account if present.");
            return;
        }

        String name = adminName != null && !adminName.trim().isEmpty() ? adminName.trim()
                : System.getenv("SUPER_ADMIN_NAME");
        String email = adminEmail != null && !adminEmail.trim().isEmpty() ? adminEmail.trim()
                : System.getenv("SUPER_ADMIN_EMAIL");
        String password = adminPassword != null && !adminPassword.trim().isEmpty() ? adminPassword.trim()
                : System.getenv("SUPER_ADMIN_PASSWORD");
        String phone = adminPhone != null && !adminPhone.trim().isEmpty() ? adminPhone.trim()
                : System.getenv("SUPER_ADMIN_PHONE");
        String resetFlag = forceReset != null && !forceReset.trim().isEmpty() ? forceReset.trim()
                : System.getenv("SUPER_ADMIN_FORCE_RESET");
        boolean isForceReset = "true".equalsIgnoreCase(resetFlag != null ? resetFlag.trim() : "");

        if (userRepository.existsByRoleIgnoreCase("super_admin")) {
            if (isForceReset) {
                if (email == null || email.isBlank() || password == null || password.isBlank()) {
                    log.warn("SUPER_ADMIN_FORCE_RESET is true, but email or password is missing. Skipping reset.");
                    return;
                }
                String normalizedEmail = email.trim().toLowerCase();
                Optional<User> userOpt = userRepository.findByEmailIgnoreCase(normalizedEmail);
                if (userOpt.isEmpty() || !"super_admin".equalsIgnoreCase(userOpt.get().getRole())) {
                    log.warn("SUPER_ADMIN_FORCE_RESET: No super admin account found matching email '{}'. Skipping reset.", normalizedEmail);
                    return;
                }
                if (!isPasswordStrong(password)) {
                    log.warn("SUPER_ADMIN_FORCE_RESET: Provided password does not meet security criteria. Skipping reset.");
                    return;
                }

                User superAdmin = userOpt.get();
                superAdmin.setPasswordHash(passwordEncoder.encode(password.trim()));
                superAdmin.setMustChangePassword(true);
                userRepository.save(superAdmin);
                log.info("Super admin password reset successfully for email: {} with mustChangePassword=true", normalizedEmail);
            } else {
                log.info("Super admin account already exists. Skipping super admin initialization.");
            }
            return;
        }

        if (name == null || name.isBlank() ||
                email == null || email.isBlank() ||
                password == null || password.isBlank() ||
                phone == null || phone.isBlank()) {
            log.warn("Super admin credentials (SUPER_ADMIN_NAME, SUPER_ADMIN_EMAIL, SUPER_ADMIN_PASSWORD, SUPER_ADMIN_PHONE) not provided in environment. Skipping super admin creation.");
            return;
        }

        String normalizedEmail = email.trim().toLowerCase();
        if (userRepository.existsByEmailIgnoreCase(normalizedEmail)) {
            log.warn("Cannot create super admin: a user with email '{}' already exists. Skipping.", normalizedEmail);
            return;
        }

        if (!isPasswordStrong(password)) {
            log.warn("Cannot create super admin: password does not meet security criteria (must be >= 12 characters and contain uppercase, lowercase, numeric, and special characters). Skipping.");
            return;
        }

        User superAdmin = User.builder()
                .fullName(name.trim())
                .email(normalizedEmail)
                .passwordHash(passwordEncoder.encode(password.trim()))
                .phone(phone.trim())
                .role("super_admin")
                .status("active")
                .mustChangePassword(false)
                .createdAt(LocalDateTime.now())
                .build();

        User savedUser = userRepository.save(superAdmin);

        StaffAdmin staffAdmin = StaffAdmin.builder()
                .user(savedUser)
                .scopeLevel("INSTITUTION")
                .build();
        staffAdminRepository.save(staffAdmin);

        log.info("Super admin initialized successfully with email: {}", normalizedEmail);
    }

    private boolean isPasswordStrong(String password) {
        if (password == null || password.length() < 12) {
            return false;
        }
        boolean hasUpper = password.chars().anyMatch(Character::isUpperCase);
        boolean hasLower = password.chars().anyMatch(Character::isLowerCase);
        boolean hasDigit = password.chars().anyMatch(Character::isDigit);
        boolean hasSymbol = password.chars().anyMatch(ch -> "!@#$%^&*()-_=+[]{}|;:'\",.<>/?`~\\".indexOf(ch) >= 0);

        return hasUpper && hasLower && hasDigit && hasSymbol;
    }
}
