package com.unilearn.server.repository;

import com.unilearn.server.model.AuditLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AuditLogRepository extends JpaRepository<AuditLog, Long> {

    List<AuditLog> findByUser_UserId(Long userId);

    List<AuditLog> findByEntityTypeAndEntityId(String entityType, Integer entityId);
}
