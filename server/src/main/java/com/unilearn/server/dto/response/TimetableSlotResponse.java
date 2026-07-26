package com.unilearn.server.dto.response;

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
public class TimetableSlotResponse {
    private Long slotId;
    private Long offeringId;
    private String courseCode;
    private String dayOfWeek;
    private LocalTime startTime;
    private LocalTime endTime;
    private String venue;
    private String slotType;
}
