package com.unilearn.server.dto.request.exam;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalTime;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class ExamFinalCreateRequestDTO {

    @NotNull(message = "Offering ID is required")
    @Positive(message = "Offering ID must be positive")
    private Long offeringId;

    private LocalDate examDate;

    private LocalTime startTime;

    private LocalTime endTime;

    @Size(max = 100, message = "Venue must not exceed 100 characters")
    private String venue;

    @NotNull(message = "Duration in minutes is required")
    @Positive(message = "Duration must be positive")
    @Min(value = 1, message = "Duration must be at least 1 minute")
    @Max(value = 1440, message = "Duration must not exceed 1440 minutes (24 hours)")
    private Integer durationMinutes;

    @NotNull(message = "Scheduled by ID is required")
    @Positive(message = "Scheduled by ID must be positive")
    private Long scheduledById;
}
