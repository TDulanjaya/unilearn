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
public class ExamQuestionResponse {
    private Long examQuestionId;
    private Long examId;
    private Long questionId;
    private String questionText;
    private String questionType;
    private String options;
    private BigDecimal marks;
    private BigDecimal marksOverride;
    private Integer orderIndex;
}
