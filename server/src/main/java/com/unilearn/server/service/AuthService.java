package com.unilearn.server.service;

import com.unilearn.server.dto.request.LoginRequest;
import com.unilearn.server.dto.request.RefreshTokenRequest;
import com.unilearn.server.dto.request.RegisterRequest;
import com.unilearn.server.dto.response.LoginResponse;
import com.unilearn.server.dto.response.RefreshTokenResponse;
import com.unilearn.server.dto.response.RegisterResponse;


public interface AuthService {

    RegisterResponse register(RegisterRequest request);

    LoginResponse login(LoginRequest request);

    RefreshTokenResponse refresh(RefreshTokenRequest request);

    void logout(String refreshToken);
}
