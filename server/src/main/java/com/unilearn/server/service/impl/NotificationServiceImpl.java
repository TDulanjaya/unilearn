package com.unilearn.server.service.impl;

import com.unilearn.server.dto.request.NotificationRequest;
import com.unilearn.server.dto.response.NotificationResponse;
import com.unilearn.server.dto.response.PageResponseDTO;
import com.unilearn.server.exception.EntryNotFoundException;
import com.unilearn.server.exception.ValidationException;
import com.unilearn.server.model.Notification;
import com.unilearn.server.model.User;
import com.unilearn.server.repository.NotificationRepository;
import com.unilearn.server.repository.UserRepository;
import com.unilearn.server.service.NotificationService;
import com.unilearn.server.util.mapper.NotificationMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class NotificationServiceImpl implements NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;
    private final NotificationMapper notificationMapper;
    private final com.unilearn.server.security.OwnershipValidator ownershipValidator;

    @Override
    @Transactional
    public NotificationResponse sendNotification(NotificationRequest request) {
        if (request == null) {
            throw new ValidationException("Notification request cannot be null");
        }

        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new EntryNotFoundException("User not found with ID: " + request.getUserId()));

        Notification notification = notificationMapper.toNotification(request, user);
        Notification saved = notificationRepository.save(notification);
        return notificationMapper.toNotificationResponse(saved);
    }

    @Override
    public PageResponseDTO<NotificationResponse> getNotificationsForUser(Long userId, Pageable pageable) {
        if (userId == null) {
            throw new ValidationException("User ID cannot be null");
        }
        if (pageable == null) {
            throw new ValidationException("Pageable parameter cannot be null");
        }
        ownershipValidator.checkUserOwnership(userId);

        if (!userRepository.existsById(userId)) {
            throw new EntryNotFoundException("User not found with ID: " + userId);
        }

        Page<Notification> page = notificationRepository.findByUser_UserId(userId, pageable);
        List<NotificationResponse> content = page.getContent()
                .stream()
                .map(notificationMapper::toNotificationResponse)
                .toList();

        return PageResponseDTO.<NotificationResponse>builder()
                .dataCount((int) page.getTotalElements())
                .dataList(content)
                .build();
    }

    @Override
    @Transactional
    public void markAsRead(Long notificationId) {
        if (notificationId == null) {
            throw new ValidationException("Notification ID cannot be null");
        }

        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new EntryNotFoundException("Notification not found with ID: " + notificationId));

        if (notification.getUser() != null) {
            ownershipValidator.checkUserOwnership(notification.getUser().getUserId());
        }

        notification.setIsRead(true);
        notificationRepository.save(notification);
    }

    @Override
    @Transactional
    public void markAllAsRead(Long userId) {
        if (userId == null) {
            throw new ValidationException("User ID cannot be null");
        }
        ownershipValidator.checkUserOwnership(userId);

        if (!userRepository.existsById(userId)) {
            throw new EntryNotFoundException("User not found with ID: " + userId);
        }

        List<Notification> unread = notificationRepository.findByUser_UserIdAndIsReadFalse(userId);
        unread.forEach(n -> n.setIsRead(true));
        notificationRepository.saveAll(unread);
    }
}
