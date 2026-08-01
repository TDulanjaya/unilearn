package com.unilearn.server.util.mapper;

import com.unilearn.server.dto.request.AuditLogRequest;
import com.unilearn.server.dto.response.AuditLogResponse;
import com.unilearn.server.exception.ValidationException;
import com.unilearn.server.model.AuditLog;
import com.unilearn.server.model.User;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Component
public class AuditLogMapper {

    public AuditLog toAuditLog(AuditLogRequest request, User user) {
        if (request == null) {
            throw new ValidationException("AuditLog request cannot be null");
        }
        return AuditLog.builder()
                .user(user)
                .action(request.getAction())
                .entityType(request.getEntityType())
                .entityId(request.getEntityId())
                .details(request.getDetails())
                .createdAt(LocalDateTime.now())
                .build();
    }

    public AuditLogResponse toAuditLogResponse(AuditLog log) {
        if (log == null) {
            throw new ValidationException("AuditLog cannot be null");
        }
        return AuditLogResponse.builder()
                .logId(log.getLogId())
                .userId(log.getUser() != null ? log.getUser().getUserId() : null)
                .userName(log.getUser() != null ? log.getUser().getFullName() : null)
                .action(log.getAction())
                .entityType(log.getEntityType())
                .entityId(log.getEntityId())
                .details(log.getDetails())
                .createdAt(log.getCreatedAt())
                .build();
    }
}
