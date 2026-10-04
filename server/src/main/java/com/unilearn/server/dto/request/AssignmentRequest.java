package com.unilearn.server.dto.request;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.FutureOrPresent;
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
import java.time.LocalDateTime;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@ToString
@Builder
public class AssignmentRequest {

    @NotNull(message = "Offering ID is required")
    @Positive(message = "Offering ID must be positive")
    private Long offeringId;

    @NotBlank(message = "Assignment title is required")
    @Size(max = 200, message = "Assignment title must not exceed 200 characters")
    private String title;

    private String description;

    @NotNull(message = "Deadline is required")
    @FutureOrPresent(message = "Deadline must be in the present or future")
    private LocalDateTime deadline;

    @NotNull(message = "Max score is required")
    @Positive(message = "Max score must be positive")
    @DecimalMin(value = "0.01", message = "Max score must be at least 0.01")
    @DecimalMax(value = "999.99", message = "Max score must not exceed 999.99")
    private BigDecimal maxScore;

    private Boolean allowResubmission;

    // set by the server from the logged in lecturer
    @Positive(message = "Creator lecturer ID must be positive")
    private Long createdById;
}
