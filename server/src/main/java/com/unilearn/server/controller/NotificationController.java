package com.unilearn.server.controller;

import com.unilearn.server.dto.response.NotificationResponse;
import com.unilearn.server.dto.response.PageResponseDTO;
import com.unilearn.server.model.User;
import com.unilearn.server.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/notifications")
@RequiredArgsConstructor
@PreAuthorize("isAuthenticated()")
public class NotificationController {

    private final NotificationService notificationService;

    @PatchMapping("/{id}/read")
    @PreAuthorize("@ownershipValidator.isNotificationOwner(#id, authentication.name)")
    public ResponseEntity<Void> markAsRead(@PathVariable Long id) {
        notificationService.markAsRead(id);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/me")
    public ResponseEntity<PageResponseDTO<NotificationResponse>> getNotificationsByUser(
            @AuthenticationPrincipal User principal,
            @PageableDefault(size = 20) Pageable pageable) {
        return ResponseEntity.ok(notificationService.getNotificationsForUser(principal.getUserId(), pageable));
    }

    @GetMapping("/user/{userId}")
    @PreAuthorize("@ownershipValidator.isUserOwner(#userId, authentication.name)")
    public ResponseEntity<PageResponseDTO<NotificationResponse>> getNotificationsByUserId(
            @PathVariable Long userId,
            @PageableDefault(size = 20) Pageable pageable) {
        return ResponseEntity.ok(notificationService.getNotificationsForUser(userId, pageable));
    }

    @PatchMapping("/user/{userId}/read-all")
    @PreAuthorize("@ownershipValidator.isUserOwner(#userId, authentication.name)")
    public ResponseEntity<Void> markAllAsRead(@PathVariable Long userId) {
        notificationService.markAllAsRead(userId);
        return ResponseEntity.ok().build();
    }

    // Unread count endpoint can be added here if needed
}
