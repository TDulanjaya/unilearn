package com.unilearn.server.repository;

import com.unilearn.server.model.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {

    List<Notification> findByUser_UserId(Long userId);

    List<Notification> findByUser_UserIdAndIsReadFalse(Long userId);
}
