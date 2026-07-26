package com.unilearn.server.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

import java.time.LocalDate;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@ToString
@Builder
public class AttendanceReportRequest {
    private Long facultyId;
    private Long departmentId;
    private Long offeringId;
    private LocalDate startDate;
    private LocalDate endDate;
}
