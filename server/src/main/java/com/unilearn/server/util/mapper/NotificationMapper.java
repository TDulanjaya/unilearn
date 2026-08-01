package com.unilearn.server.util.mapper;

import com.unilearn.server.dto.request.NotificationRequest;
import com.unilearn.server.dto.response.NotificationResponse;
import com.unilearn.server.exception.ValidationException;
import com.unilearn.server.model.Notification;
import com.unilearn.server.model.User;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Component
public class NotificationMapper {

    public Notification toNotification(NotificationRequest request, User user) {
        if (request == null) {
            throw new ValidationException("Notification request cannot be null");
        }
        return Notification.builder()
                .user(user)
                .type(request.getType())
                .title(request.getTitle())
                .message(request.getMessage())
                .refTable(request.getRefTable())
                .refId(request.getRefId())
                .isRead(false)
                .createdAt(LocalDateTime.now())
                .build();
    }

    public NotificationResponse toNotificationResponse(Notification notification) {
        if (notification == null) {
            throw new ValidationException("Notification cannot be null");
        }
        return NotificationResponse.builder()
                .notificationId(notification.getNotificationId())
                .userId(notification.getUser() != null ? notification.getUser().getUserId() : null)
                .type(notification.getType())
                .title(notification.getTitle())
                .message(notification.getMessage())
                .refTable(notification.getRefTable())
                .refId(notification.getRefId())
                .isRead(notification.getIsRead())
                .createdAt(notification.getCreatedAt())
                .build();
    }
}
