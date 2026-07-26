package com.unilearn.server.dto.request;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
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
public class QuestionRequest {

    @NotNull(message = "Bank ID is required")
    @Positive(message = "Bank ID must be positive")
    private Long bankId;

    @NotBlank(message = "Question text is required")
    private String questionText;

    @NotBlank(message = "Question type is required")
    @Size(max = 20, message = "Question type must not exceed 20 characters")
    private String questionType;

    private String options;

    private String correctAnswer;

    @NotNull(message = "Marks are required")
    @Positive(message = "Marks must be positive")
    @DecimalMin(value = "0.01", message = "Marks must be at least 0.01")
    @DecimalMax(value = "999.99", message = "Marks must not exceed 999.99")
    private BigDecimal marks;

    @Size(max = 10, message = "Difficulty must not exceed 10 characters")
    private String difficulty;

    @Size(max = 100, message = "Topic must not exceed 100 characters")
    private String topic;
}
