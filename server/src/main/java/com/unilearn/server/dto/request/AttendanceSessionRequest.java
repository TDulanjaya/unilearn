package com.unilearn.server.dto.request;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PastOrPresent;
import jakarta.validation.constraints.Positive;
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
public class AttendanceSessionRequest {

    @NotNull(message = "Offering ID is required")
    @Positive(message = "Offering ID must be positive")
    private Long offeringId;

    @NotNull(message = "Session date is required")
    @PastOrPresent(message = "Session date must be in the past or present")
    private LocalDate sessionDate;

    private LocalTime startTime;

    private LocalTime endTime;

    @NotNull(message = "Lecturer ID is required")
    @Positive(message = "Lecturer ID must be positive")
    private Long markedByLecturerId;
}
