package com.unilearn.server.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

import java.math.BigDecimal;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@ToString
@Builder
public class ExamAnswerResponse {
    private Long answerId;
    private Long attemptId;
    private Long examQuestionId;
    private Long questionId;
    private String answerText;
    private String selectedOption;
    private Boolean isCorrect;
    private BigDecimal marksAwarded;
    private Long gradedById;
    private String gradedByName;
}
