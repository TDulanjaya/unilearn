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
public class SubmissionRequest {

    @NotNull(message = "Assignment ID is required")
    @Positive(message = "Assignment ID must be positive")
    private Long assignmentId;

    @NotNull(message = "Student ID is required")
    @Positive(message = "Student ID must be positive")
    private Long studentId;

    @Size(max = 500, message = "File URL must not exceed 500 characters")
    private String fileUrl;

    private Boolean isResubmission;

    @DecimalMin(value = "0.00", message = "Grade must be at least 0.00")
    @DecimalMax(value = "999.99", message = "Grade must not exceed 999.99")
    private BigDecimal grade;

    private String feedback;

    private Long gradedById;
}
