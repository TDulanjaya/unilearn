package com.unilearn.server.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
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
    private Long offeringId;

    @NotNull(message = "Student ID is required")
    private Long studentId;

    @NotBlank(message = "Component type is required")
    @Size(max = 30, message = "Component type must not exceed 30 characters")
    private String component;

    private Integer componentRefId;

    @NotNull(message = "Weight percentage is required")
    private BigDecimal weightPct;

    @NotNull(message = "Score is required")
    private BigDecimal score;
}
