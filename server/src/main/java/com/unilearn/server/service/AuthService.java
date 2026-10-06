package com.unilearn.server.service;

import com.unilearn.server.dto.request.LoginRequest;
import com.unilearn.server.dto.request.RegisterRequest;
import com.unilearn.server.dto.response.AuthResponse;

public interface AuthService {

    AuthResponse register(RegisterRequest request);

    AuthResponse createStaffUser(RegisterRequest request);

    AuthResponse login(LoginRequest request);

    AuthResponse verifySuperAdminOtp(com.unilearn.server.dto.request.VerifyOtpRequest request);

    com.unilearn.server.dto.response.RefreshTokenResponse refresh(com.unilearn.server.dto.request.RefreshTokenRequest request);

    // returns new tokens, the old ones stop working
    com.unilearn.server.dto.response.RefreshTokenResponse changePassword(com.unilearn.server.dto.request.ChangePasswordRequest request);

    void logout(String authHeader, String refreshToken);
}
