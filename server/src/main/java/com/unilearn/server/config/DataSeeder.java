package com.unilearn.server.config;

import com.unilearn.server.model.User;
import com.unilearn.server.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        seedIfMissing("admin@uni.edu", "System Administrator", "admin123", "staff_admin", "0771234567");
        seedIfMissing("lecturer@uni.edu", "Dr. K. Perera", "admin123", "lecturer", "0719876543");
        seedIfMissing("student@uni.edu", "Nadeesha Silva", "admin123", "student", "0779998877");
        seedIfMissing("hod@uni.edu", "Dr. S. Wickramasinghe", "admin123", "hod_dean", "0755544332");
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
            userRepository.save(user);
            log.info("Seeded default user: {}", email);
        }
    }
}
