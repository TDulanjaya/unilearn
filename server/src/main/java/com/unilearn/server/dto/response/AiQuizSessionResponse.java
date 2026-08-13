package com.unilearn.server.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@ToString
@Builder
public class AiQuizSessionResponse {
    private Long sessionId;
    private Long studentId;
    private Long offeringId;
    private String questionType;
    private Integer questionCount;
    private String sourceScope;
    private LocalDateTime createdAt;
    private List<AiQuizQuestionResponse> questions;
    @Builder.Default
    private Boolean aiGenerated = true;
}
