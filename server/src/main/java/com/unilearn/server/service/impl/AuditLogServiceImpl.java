package com.unilearn.server.service.impl;

import com.unilearn.server.dto.request.AuditLogRequest;
import com.unilearn.server.dto.response.AuditLogResponse;
import com.unilearn.server.dto.response.PageResponseDTO;
import com.unilearn.server.exception.EntryNotFoundException;
import com.unilearn.server.exception.ValidationException;
import com.unilearn.server.model.AuditLog;
import com.unilearn.server.model.User;
import com.unilearn.server.repository.AuditLogRepository;
import com.unilearn.server.repository.UserRepository;
import com.unilearn.server.service.AuditLogService;
import com.unilearn.server.util.AuditLogMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AuditLogServiceImpl implements AuditLogService {

    private final AuditLogRepository auditLogRepository;
    private final UserRepository userRepository;
    private final AuditLogMapper auditLogMapper;

    @Override
    @Transactional
    public AuditLogResponse logAction(AuditLogRequest request) {
        if (request == null) {
            throw new ValidationException("AuditLog request cannot be null");
        }

        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new EntryNotFoundException("User not found with ID: " + request.getUserId()));

        AuditLog log = auditLogMapper.toAuditLog(request, user);
        AuditLog saved = auditLogRepository.save(log);
        return auditLogMapper.toAuditLogResponse(saved);
    }

    @Override
    public PageResponseDTO<AuditLogResponse> getAuditLogs(Pageable pageable) {
        if (pageable == null) {
            throw new ValidationException("Pageable parameter cannot be null");
        }

        Page<AuditLog> page = auditLogRepository.findAll(pageable);
        List<AuditLogResponse> content = page.getContent()
                .stream()
                .map(auditLogMapper::toAuditLogResponse)
                .toList();

        return PageResponseDTO.<AuditLogResponse>builder()
                .dataCount((int) page.getTotalElements())
                .dataList(content)
                .build();
    }

    @Override
    public PageResponseDTO<AuditLogResponse> getLogsByUser(Long userId, Pageable pageable) {
        if (userId == null) {
            throw new ValidationException("User ID cannot be null");
        }
        if (pageable == null) {
            throw new ValidationException("Pageable parameter cannot be null");
        }
        if (!userRepository.existsById(userId)) {
            throw new EntryNotFoundException("User not found with ID: " + userId);
        }

        Page<AuditLog> page = auditLogRepository.findByUser_UserId(userId, pageable);
        List<AuditLogResponse> content = page.getContent()
                .stream()
                .map(auditLogMapper::toAuditLogResponse)
                .toList();

        return PageResponseDTO.<AuditLogResponse>builder()
                .dataCount((int) page.getTotalElements())
                .dataList(content)
                .build();
    }
}
