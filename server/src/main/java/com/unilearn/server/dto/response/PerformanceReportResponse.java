package com.unilearn.server.dto.response;

import com.unilearn.server.dto.response.report.LabeledCountDTO;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

import java.util.List;

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

    private List<LabeledCountDTO> gradeDistribution;
}
