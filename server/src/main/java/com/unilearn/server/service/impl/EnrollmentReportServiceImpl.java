package com.unilearn.server.service.impl;

import com.unilearn.server.dto.response.EnrollmentReportResponse;
import com.unilearn.server.dto.response.report.LabeledCountDTO;
import com.unilearn.server.dto.response.report.MonthlyPointDTO;
import com.unilearn.server.service.EnrollmentReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Arrays;
import java.util.Collections;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class EnrollmentReportServiceImpl implements EnrollmentReportService {

    @Override
    public List<EnrollmentReportResponse> generateReport(Long facultyId, Long departmentId, Long courseId) {
        List<MonthlyPointDTO> trend = Arrays.asList(
                MonthlyPointDTO.builder().month("2026-05").value(95.0).build(),
                MonthlyPointDTO.builder().month("2026-06").value(110.0).build(),
                MonthlyPointDTO.builder().month("2026-07").value(120.0).build()
        );

        List<LabeledCountDTO> byDept = Arrays.asList(
                LabeledCountDTO.builder().label("Computer Science").count(70).build(),
                LabeledCountDTO.builder().label("Software Engineering").count(50).build()
        );

        return Collections.singletonList(
                EnrollmentReportResponse.builder()
                        .facultyId(facultyId)
                        .departmentId(departmentId)
                        .courseId(courseId)
                        .enrolledCount(120)
                        .capacity(150)
                        .enrollmentTrendPercent(5.5)
                        .enrollmentTrend(trend)
                        .byDepartment(byDept)
                        .build()
        );
    }
}
