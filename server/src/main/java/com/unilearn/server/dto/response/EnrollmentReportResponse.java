package com.unilearn.server.dto.response;

import com.unilearn.server.dto.response.report.LabeledCountDTO;
import com.unilearn.server.dto.response.report.MonthlyPointDTO;
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
public class EnrollmentReportResponse {
    private Long facultyId;
    private String facultyName;
    private Long departmentId;
    private String departmentName;
    private Long courseId;
    private String courseCode;
    private Long batchId;
    private String batchName;
    private Integer enrolledCount;
    private Integer capacity;
    private Double enrollmentTrendPercent;

    private List<MonthlyPointDTO> enrollmentTrend;
    private List<LabeledCountDTO> byDepartment;
}
