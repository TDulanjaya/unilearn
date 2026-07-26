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
public class MessageResponse {
    private Long messageId;
    private Long senderId;
    private String senderName;
    private Long recipientId;
    private Long receiverId;
    private String recipientName;
    private String receiverName;
    private String content;
    private LocalDateTime sentAt;
    private LocalDateTime readAt;
    private Boolean isRead;
}
