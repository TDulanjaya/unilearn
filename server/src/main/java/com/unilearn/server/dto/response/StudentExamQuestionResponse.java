package com.unilearn.server.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

import java.math.BigDecimal;

// Exam question without answers for students
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@ToString
@Builder
public class StudentExamQuestionResponse {
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
