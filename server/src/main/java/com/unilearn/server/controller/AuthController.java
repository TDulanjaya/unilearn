package com.unilearn.server.controller;

import com.unilearn.server.dto.request.LoginRequest;
import com.unilearn.server.dto.request.RegisterRequest;
import com.unilearn.server.dto.response.AuthResponse;
import com.unilearn.server.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * Authentication controller — all endpoints are public (no @PreAuthorize).
 * These paths must be included in SecurityConfig PUBLIC_PATHS.
 */
@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(authService.register(request));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    // TODO: POST /refresh — AuthService does not have a refresh() method yet.
    //       Add AuthResponse refresh(RefreshTokenRequest request) to AuthService,
    //       then uncomment and wire up this endpoint.
    //
    // @PostMapping("/refresh")
    // public ResponseEntity<RefreshTokenResponse> refresh(@Valid @RequestBody RefreshTokenRequest request) {
    //     return ResponseEntity.ok(authService.refresh(request));
    // }

    // TODO: POST /logout — AuthService does not have a logout() method yet.
    //       Add void logout(String token) to AuthService,
    //       then uncomment and wire up this endpoint.
    //
    // @PostMapping("/logout")
    // public ResponseEntity<Void> logout(@RequestHeader("Authorization") String authHeader) {
    //     authService.logout(authHeader);
    //     return ResponseEntity.noContent().build();
    // }
}
