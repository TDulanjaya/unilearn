package com.unilearn.server.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@ToString
@Builder
public class ExamResultResponse {
    private Long resultId;
    private Long examId;
    private Long studentId;
    private String studentName;
    private BigDecimal totalScore;
    private BigDecimal score;
    private String grade;
    private LocalDateTime publishedAt;
}
