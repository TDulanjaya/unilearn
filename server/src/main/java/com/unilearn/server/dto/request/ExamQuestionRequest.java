package com.unilearn.server.dto.request;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
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
public class ExamQuestionRequest {

    @NotNull(message = "Exam ID is required")
    @Positive(message = "Exam ID must be positive")
    private Long examId;

    @NotNull(message = "Question ID is required")
    @Positive(message = "Question ID must be positive")
    private Long questionId;

    @DecimalMin(value = "0.00", message = "Marks override must be at least 0.00")
    @DecimalMax(value = "999.99", message = "Marks override must not exceed 999.99")
    private BigDecimal marksOverride;
}
