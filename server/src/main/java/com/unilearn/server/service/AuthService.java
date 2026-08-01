package com.unilearn.server.service;

import com.unilearn.server.dto.request.LoginRequest;
import com.unilearn.server.dto.request.RegisterRequest;
import com.unilearn.server.dto.response.AuthResponse;

public interface AuthService {

    AuthResponse register(RegisterRequest request);

    AuthResponse login(LoginRequest request);
}
