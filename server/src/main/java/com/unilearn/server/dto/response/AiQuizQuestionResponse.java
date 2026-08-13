package com.unilearn.server.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@ToString
@Builder
public class AiQuizQuestionResponse {
    private Long questionId;
    private Long sessionId;
    private Integer orderNo;
    private String questionText;
    private String questionType;
    private String options;
    private String correctAnswer;
    private String studentAnswer;
    private Boolean isCorrect;
    private Boolean answerRevealed;
    @Builder.Default
    private Boolean aiGenerated = true;
}
