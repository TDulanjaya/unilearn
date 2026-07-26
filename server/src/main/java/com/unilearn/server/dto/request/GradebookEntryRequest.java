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
public class GradebookEntryRequest {

    @NotNull(message = "Offering ID is required")
    @Positive(message = "Offering ID must be positive")
    private Long offeringId;

    @NotNull(message = "Student ID is required")
    @Positive(message = "Student ID must be positive")
    private Long studentId;

    @NotBlank(message = "Component type is required")
    @Size(max = 30, message = "Component type must not exceed 30 characters")
    private String component;

    private Integer componentRefId;

    @NotNull(message = "Weight percentage is required")
    @DecimalMin(value = "0.00", message = "Weight percentage must be at least 0.00")
    @DecimalMax(value = "100.00", message = "Weight percentage must not exceed 100.00")
    private BigDecimal weightPct;

    @NotNull(message = "Score is required")
    @DecimalMin(value = "0.00", message = "Score must be at least 0.00")
    @DecimalMax(value = "999.99", message = "Score must not exceed 999.99")
    private BigDecimal score;
}
