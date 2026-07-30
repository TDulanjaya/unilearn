package com.unilearn.server.repository;

import com.unilearn.server.model.Notification;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

import java.util.List;

@EnableJpaRepositories
public interface NotificationRepository extends JpaRepository<Notification, Long> {

    List<Notification> findByUser_UserId(Long userId);

    Page<Notification> findByUser_UserId(Long userId, Pageable pageable);

    List<Notification> findByUser_UserIdAndIsReadFalse(Long userId);
}
