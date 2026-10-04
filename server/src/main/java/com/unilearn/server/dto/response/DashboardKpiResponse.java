package com.unilearn.server.dto.response;

import com.unilearn.server.dto.response.report.LabeledCountDTO;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@ToString
@Builder
public class DashboardKpiResponse {
    private Long totalStudents;
    private Long totalLecturers;
    private Long totalCourses;
    private Long totalActiveOfferings;
    private Long totalEnrollments;
    private Double averageAttendanceRate;
    private Double averageExamPassRate;
    // how many rows the two rates above came from (0 = no data yet)
    private Long attendanceRecordCount;
    private Long examResultCount;
    private LocalDateTime generatedAt;

    private List<LabeledCountDTO> usersByRole;
}
