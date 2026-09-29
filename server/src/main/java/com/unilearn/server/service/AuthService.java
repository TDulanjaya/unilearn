package com.unilearn.server.service;

import com.unilearn.server.dto.request.LoginRequest;
import com.unilearn.server.dto.request.RegisterRequest;
import com.unilearn.server.dto.response.AuthResponse;

public interface AuthService {

    AuthResponse register(RegisterRequest request);

    AuthResponse createStaffUser(RegisterRequest request);

    AuthResponse login(LoginRequest request);

    com.unilearn.server.dto.response.RefreshTokenResponse refresh(com.unilearn.server.dto.request.RefreshTokenRequest request);

    void changePassword(com.unilearn.server.dto.request.ChangePasswordRequest request);

    void logout(String token);
}
