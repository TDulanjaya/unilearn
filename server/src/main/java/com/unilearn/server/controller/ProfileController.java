package com.unilearn.server.controller;

import com.unilearn.server.dto.request.ProfilePhotoRequest;
import com.unilearn.server.dto.response.UserResponse;
import com.unilearn.server.model.User;
import com.unilearn.server.service.ProfileService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/profile")
@RequiredArgsConstructor
@PreAuthorize("isAuthenticated()")
public class ProfileController {

    private final ProfileService profileService;

    @GetMapping("/me")
    public ResponseEntity<UserResponse> getMyProfile(@AuthenticationPrincipal User principal) {
        return ResponseEntity.ok(profileService.getProfile(principal.getUserId()));
    }

    @PatchMapping("/me/photo")
    public ResponseEntity<UserResponse> updateMyPhoto(
            @AuthenticationPrincipal User principal,
            @Valid @RequestBody ProfilePhotoRequest request) {
        return ResponseEntity.ok(profileService.updatePhoto(principal.getUserId(), request.getPhotoUrl()));
    }
}
