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
public class QuestionResponse {
    private Long questionId;
    private Long bankId;
    private String questionText;
    private String questionType;
    private String options;
    private String correctAnswer;
    private BigDecimal marks;
    private String difficulty;
    private String topic;
}
