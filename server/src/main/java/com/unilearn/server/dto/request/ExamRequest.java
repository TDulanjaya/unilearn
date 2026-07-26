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

import java.time.LocalDate;
import java.time.LocalTime;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@ToString
@Builder
public class ExamRequest {

    @NotNull(message = "Offering ID is required")
    private Long offeringId;

    @NotBlank(message = "Exam type is required")
    @Size(max = 20, message = "Exam type must not exceed 20 characters")
    private String examType;

    @NotNull(message = "Scheduled by user ID is required")
    private Long scheduledByUserId;

    private Long linkedSlotId;

    @NotNull(message = "Exam date is required")
    private LocalDate examDate;

    @NotNull(message = "Start time is required")
    private LocalTime startTime;

    @NotNull(message = "End time is required")
    private LocalTime endTime;

    @Size(max = 100, message = "Venue must not exceed 100 characters")
    private String venue;

    @NotNull(message = "Duration in minutes is required")
    private Integer durationMinutes;

    @Size(max = 20, message = "Status must not exceed 20 characters")
    private String status;
}
