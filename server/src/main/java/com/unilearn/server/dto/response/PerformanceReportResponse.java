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
public class PerformanceReportResponse {
    private Long facultyId;
    private String facultyName;
    private Long departmentId;
    private String departmentName;
    private Long offeringId;
    private String courseCode;
    private Double averageAssignmentScore;
    private Double averageExamScore;
    private Double passRatePercent;
    private Integer studentCount;
}
