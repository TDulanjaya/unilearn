package com.unilearn.server.service.impl;

import com.unilearn.server.dto.request.LoginRequest;
import com.unilearn.server.dto.request.RefreshTokenRequest;
import com.unilearn.server.dto.request.RegisterRequest;
import com.unilearn.server.dto.response.LoginResponse;
import com.unilearn.server.dto.response.RefreshTokenResponse;
import com.unilearn.server.dto.response.RegisterResponse;
import com.unilearn.server.exception.ValidationException;
import com.unilearn.server.model.User;
import com.unilearn.server.repository.UserRepository;
import com.unilearn.server.security.JwtService;
import com.unilearn.server.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    @Override
    @Transactional
    public RegisterResponse register(RegisterRequest request) {
        if (request == null) {
            throw new ValidationException("Register request cannot be null");
        }

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new com.unilearn.server.exception.IllegalStateException("Email already registered: " + request.getEmail());
        }

        String passwordHash = passwordEncoder.encode(request.getPassword());
        User user = User.builder()
                .fullName(request.getFullName())
                .email(request.getEmail())
                .passwordHash(passwordHash)
                .phone(request.getPhone())
                .role(request.getRole() != null ? request.getRole() : "student")
                .status("active")
                .build();

        User saved = userRepository.save(user);
        String accessToken = jwtService.generateAccessToken(saved.getEmail(), saved.getRole());
        String refreshToken = jwtService.generateRefreshToken(saved.getEmail());

        return RegisterResponse.builder()
                .userId(saved.getUserId())
                .email(saved.getEmail())
                .role(saved.getRole())
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .build();
    }

    @Override
    @Transactional
    public LoginResponse login(LoginRequest request) {
        if (request == null) {
            throw new ValidationException("Login request cannot be null");
        }

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new ValidationException("Invalid credentials"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new ValidationException("Invalid credentials");
        }

        String accessToken = jwtService.generateAccessToken(user.getEmail(), user.getRole());
        String refreshToken = jwtService.generateRefreshToken(user.getEmail());

        return LoginResponse.builder()
                .userId(user.getUserId())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .role(user.getRole())
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .build();
    }

    @Override
    public RefreshTokenResponse refresh(RefreshTokenRequest request) {
        if (request == null || request.getRefreshToken() == null) {
            throw new ValidationException("Refresh token is required");
        }

        if (!jwtService.validateToken(request.getRefreshToken())) {
            throw new ValidationException("Invalid or expired refresh token");
        }

        String email = jwtService.getEmailFromToken(request.getRefreshToken());
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ValidationException("User not found for token"));

        String newAccessToken = jwtService.generateAccessToken(user.getEmail(), user.getRole());
        String newRefreshToken = jwtService.generateRefreshToken(user.getEmail());

        return RefreshTokenResponse.builder()
                .accessToken(newAccessToken)
                .refreshToken(newRefreshToken)
                .build();
    }

    @Override
    @Transactional
    public void logout(String refreshToken) {
        if (refreshToken == null || refreshToken.isBlank()) {
            throw new ValidationException("Refresh token is required for logout");
        }
    }
}
