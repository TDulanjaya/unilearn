package com.unilearn.server.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

import java.time.LocalDateTime;

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
    private LocalDateTime generatedAt;
}
