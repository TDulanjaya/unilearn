package com.unilearn.server.controller;

import com.unilearn.server.dto.request.RegisterRequest;
import com.unilearn.server.dto.response.AuthResponse;
import com.unilearn.server.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/admin")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('STAFF_ADMIN', 'SUPER_ADMIN')")
public class AdminController {

    private final AuthService authService;

    @PostMapping("/users")
    public ResponseEntity<AuthResponse> createStaffUser(@Valid @RequestBody RegisterRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(authService.createStaffUser(request));
    }
}
