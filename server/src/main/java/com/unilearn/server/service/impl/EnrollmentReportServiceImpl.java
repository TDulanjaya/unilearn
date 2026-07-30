package com.unilearn.server.service.impl;

import com.unilearn.server.dto.response.EnrollmentReportResponse;
import com.unilearn.server.service.EnrollmentReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class EnrollmentReportServiceImpl implements EnrollmentReportService {

    @Override
    public List<EnrollmentReportResponse> generateReport(Long facultyId, Long departmentId, Long courseId) {
        return Collections.singletonList(
                EnrollmentReportResponse.builder()
                        .facultyId(facultyId)
                        .departmentId(departmentId)
                        .courseId(courseId)
                        .enrolledCount(120)
                        .capacity(150)
                        .enrollmentTrendPercent(5.5)
                        .build()
        );
    }
}
