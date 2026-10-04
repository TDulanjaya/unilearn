package com.unilearn.server.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

import java.time.LocalDateTime;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@ToString
@Builder
public class AuditLogResponse {
    private Long logId;
    private Long userId;
    private String userName;
    private String userEmail;
    private String action;
    private String entityType;
    private Integer entityId;
    private String details;
    private LocalDateTime createdAt;
}
