package com.unilearn.server.controller;

import com.unilearn.server.dto.response.NotificationResponse;
import com.unilearn.server.dto.response.PageResponseDTO;
import com.unilearn.server.model.User;
import com.unilearn.server.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;

    @PatchMapping("/{id}/read")
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

    // TODO: GET /me/unread-count — NotificationService does not have getUnreadCount() yet.
}
