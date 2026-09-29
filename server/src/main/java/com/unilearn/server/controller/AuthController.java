package com.unilearn.server.controller;

import com.unilearn.server.dto.request.LoginRequest;
import com.unilearn.server.dto.request.RegisterRequest;
import com.unilearn.server.dto.response.AuthResponse;
import com.unilearn.server.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import com.unilearn.server.dto.request.ChangePasswordRequest;
import com.unilearn.server.dto.request.RefreshTokenRequest;
import com.unilearn.server.dto.response.RefreshTokenResponse;
import com.unilearn.server.exception.ValidationException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;

// Auth endpoints
@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @Value("${app.cookie.secure:false}")
    private boolean cookieSecure;

    @Value("${app.cookie.same-site:Strict}")
    private String cookieSameSite;

    private boolean isSecureRequest(HttpServletRequest request) {
        if ("None".equalsIgnoreCase(cookieSameSite)) {
            return true;
        }
        return cookieSecure || request.isSecure() || "https".equalsIgnoreCase(request.getHeader("X-Forwarded-Proto"));
    }

    private void addRefreshTokenCookie(HttpServletResponse response, HttpServletRequest request, String refreshToken, long maxAgeSeconds) {
        String sameSiteValue = cookieSameSite != null && !cookieSameSite.isBlank() ? cookieSameSite.trim() : "Strict";
        boolean secure = "None".equalsIgnoreCase(sameSiteValue) || isSecureRequest(request);

        ResponseCookie cookie = ResponseCookie.from("refreshToken", refreshToken)
                .httpOnly(true)
                .secure(secure)
                .path("/")
                .maxAge(maxAgeSeconds)
                .sameSite(sameSiteValue)
                .build();
        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());
    }

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(
            @Valid @RequestBody RegisterRequest request,
            HttpServletRequest httpRequest,
            HttpServletResponse httpResponse) {
        AuthResponse response = authService.register(request);
        if (response.getRefreshToken() != null) {
            addRefreshTokenCookie(httpResponse, httpRequest, response.getRefreshToken(), 7 * 24 * 60 * 60);
            response.setRefreshToken(null);
        }
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(
            @Valid @RequestBody LoginRequest request,
            HttpServletRequest httpRequest,
            HttpServletResponse httpResponse) {
        AuthResponse response = authService.login(request);
        if (response.getRefreshToken() != null) {
            addRefreshTokenCookie(httpResponse, httpRequest, response.getRefreshToken(), 7 * 24 * 60 * 60);
            response.setRefreshToken(null);
        }
        return ResponseEntity.ok(response);
    }

    @PostMapping("/refresh")
    public ResponseEntity<RefreshTokenResponse> refresh(
            @RequestBody(required = false) RefreshTokenRequest request,
            @CookieValue(name = "refreshToken", required = false) String cookieRefreshToken,
            HttpServletRequest httpRequest,
            HttpServletResponse httpResponse) {
        String tokenToUse = (request != null && request.getRefreshToken() != null && !request.getRefreshToken().isBlank())
                ? request.getRefreshToken()
                : cookieRefreshToken;

        if (tokenToUse == null || tokenToUse.isBlank()) {
            throw new ValidationException("Refresh token is required");
        }

        RefreshTokenResponse response = authService.refresh(new RefreshTokenRequest(tokenToUse));
        if (response.getRefreshToken() != null) {
            addRefreshTokenCookie(httpResponse, httpRequest, response.getRefreshToken(), 7 * 24 * 60 * 60);
            response.setRefreshToken(null);
        }
        return ResponseEntity.ok(response);
    }

    @PostMapping("/change-password")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<java.util.Map<String, String>> changePassword(@Valid @RequestBody ChangePasswordRequest request) {
        authService.changePassword(request);
        return ResponseEntity.ok(java.util.Map.of("message", "Password changed successfully."));
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            HttpServletRequest httpRequest,
            HttpServletResponse httpResponse) {
        if (authHeader != null && !authHeader.isBlank()) {
            authService.logout(authHeader);
        }
        addRefreshTokenCookie(httpResponse, httpRequest, "", 0);
        return ResponseEntity.noContent().build();
    }
}
