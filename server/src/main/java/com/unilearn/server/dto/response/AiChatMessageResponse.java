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
public class AiChatMessageResponse {
    private Long messageId;
    private Long studentId;
    private Long offeringId;
    private String role;
    private String content;
    private LocalDateTime createdAt;
    @Builder.Default
    private Boolean aiGenerated = true;
}
