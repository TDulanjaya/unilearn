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

import java.time.LocalTime;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@ToString
@Builder
public class TimetableSlotRequestDTO {

    @NotNull(message = "Offering ID is required")
    private Long offeringId;

    @NotBlank(message = "Day of week is required")
    @Size(max = 10, message = "Day of week must not exceed 10 characters")
    private String dayOfWeek;

    @NotNull(message = "Start time is required")
    private LocalTime startTime;

    @NotNull(message = "End time is required")
    private LocalTime endTime;

    @Size(max = 100, message = "Venue must not exceed 100 characters")
    private String venue;

    @Size(max = 20, message = "Slot type must not exceed 20 characters")
    private String slotType;
}
