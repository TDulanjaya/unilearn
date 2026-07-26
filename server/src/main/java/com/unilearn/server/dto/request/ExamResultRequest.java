package com.unilearn.server.dto.request;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
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
public class ExamResultRequest {

    @NotNull(message = "Attempt ID is required")
    @Positive(message = "Attempt ID must be positive")
    private Long attemptId;

    @NotNull(message = "Exam ID is required")
    @Positive(message = "Exam ID must be positive")
    private Long examId;

    @NotNull(message = "Student ID is required")
    @Positive(message = "Student ID must be positive")
    private Long studentId;

    @NotNull(message = "Score is required")
    @DecimalMin(value = "0.00", message = "Score must be at least 0.00")
    @DecimalMax(value = "999.99", message = "Score must not exceed 999.99")
    private BigDecimal score;

    @Size(max = 10, message = "Grade must not exceed 10 characters")
    private String grade;

    private Boolean isPublished;
}
