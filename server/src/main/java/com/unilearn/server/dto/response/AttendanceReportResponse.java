package com.unilearn.server.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@ToString
@Builder
public class AttendanceReportResponse {
    private Long facultyId;
    private String facultyName;
    private Long departmentId;
    private String departmentName;
    private Long offeringId;
    private String courseCode;
    private Integer totalSessions;
    private Integer presentCount;
    private Integer absentCount;
    private Integer lateCount;
    private Double attendanceRatePercent;
}
