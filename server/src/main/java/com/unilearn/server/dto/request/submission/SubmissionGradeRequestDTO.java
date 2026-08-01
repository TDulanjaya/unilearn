package com.unilearn.server.dto.request.submission;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class SubmissionGradeRequestDTO {

    @NotNull(message = "Grade is required")
    @DecimalMin(value = "0.00", message = "Grade must be at least 0.00")
    @DecimalMax(value = "999.99", message = "Grade must not exceed 999.99")
    private BigDecimal grade;

    private String feedback;
}
