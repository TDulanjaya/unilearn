package com.unilearn.server.service;

import com.unilearn.server.dto.request.NotificationRequest;
import com.unilearn.server.dto.response.NotificationResponse;
import com.unilearn.server.dto.response.PageResponseDTO;
import org.springframework.data.domain.Pageable;

// User notifications service
public interface NotificationService {

    NotificationResponse sendNotification(NotificationRequest request);

    PageResponseDTO<NotificationResponse> getNotificationsForUser(Long userId, Pageable pageable);

    void markAsRead(Long notificationId);

    void markAllAsRead(Long userId);
}
