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
import java.time.LocalDateTime;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@ToString
@Builder
public class AssignmentRequest {

    @NotNull(message = "Offering ID is required")
    private Long offeringId;

    @NotBlank(message = "Assignment title is required")
    @Size(max = 200, message = "Assignment title must not exceed 200 characters")
    private String title;

    private String description;

    @NotNull(message = "Deadline is required")
    private LocalDateTime deadline;

    @NotNull(message = "Max score is required")
    private BigDecimal maxScore;

    private Boolean allowResubmission;

    @NotNull(message = "Creator lecturer ID is required")
    private Long createdById;
}
