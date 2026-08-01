package com.unilearn.server.controller;

import com.unilearn.server.dto.response.AuditLogResponse;
import com.unilearn.server.dto.response.PageResponseDTO;
import com.unilearn.server.service.AuditLogService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

/**
 * Audit log controller — read-only, STAFF_ADMIN only.
 * No create endpoint — logAction() is called internally by other services.
 */
@RestController
@RequestMapping("/api/v1/audit-logs")
@RequiredArgsConstructor
@PreAuthorize("hasRole('STAFF_ADMIN')")
public class AuditLogController {

    private final AuditLogService auditLogService;

    @GetMapping
    public ResponseEntity<PageResponseDTO<AuditLogResponse>> getFilteredLogs(
            @RequestParam(required = false) Long userId,
            @PageableDefault(size = 20) Pageable pageable) {
        if (userId != null) {
            return ResponseEntity.ok(auditLogService.getLogsByUser(userId, pageable));
        }
        return ResponseEntity.ok(auditLogService.getAuditLogs(pageable));
    }
}
