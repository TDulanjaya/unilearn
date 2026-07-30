package com.unilearn.server.service;

import com.unilearn.server.dto.request.AuditLogRequest;
import com.unilearn.server.dto.response.AuditLogResponse;
import com.unilearn.server.dto.response.PageResponseDTO;
import org.springframework.data.domain.Pageable;

/**
 * Service interface for managing audit logs.
 */
public interface AuditLogService {

    AuditLogResponse logAction(AuditLogRequest request);

    PageResponseDTO<AuditLogResponse> getAuditLogs(Pageable pageable);

    PageResponseDTO<AuditLogResponse> getLogsByUser(Long userId, Pageable pageable);
}
