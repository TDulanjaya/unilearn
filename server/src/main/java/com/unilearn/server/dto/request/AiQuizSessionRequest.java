package com.unilearn.server.dto.request;

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

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@ToString
@Builder
public class AiQuizSessionRequest {

    // Derived from JWT principal in controller
    private Long studentId;

    @NotNull(message = "Offering ID is required")
    @Positive(message = "Offering ID must be positive")
    private Long offeringId;

    @NotBlank(message = "Question type is required")
    @Size(max = 20, message = "Question type must not exceed 20 characters")
    private String questionType;

    @NotNull(message = "Question count is required")
    @Positive(message = "Question count must be positive")
    private Integer questionCount;

    @NotBlank(message = "Source scope is required")
    @Size(max = 20, message = "Source scope must not exceed 20 characters")
    private String sourceScope;
}
