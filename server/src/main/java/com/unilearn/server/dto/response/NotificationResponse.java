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
public class NotificationResponse {
    private Long notificationId;
    private Long userId;
    private String type;
    private String title;
    private String message;
    private String refTable;
    private Integer refId;
    private Boolean isRead;
    private LocalDateTime createdAt;
}
