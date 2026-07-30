package com.unilearn.server.service.impl;

import com.unilearn.server.dto.response.PerformanceReportResponse;
import com.unilearn.server.service.PerformanceReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class PerformanceReportServiceImpl implements PerformanceReportService {

    @Override
    public List<PerformanceReportResponse> generateReport(Long facultyId, Long departmentId, Long offeringId) {
        return Collections.singletonList(
                PerformanceReportResponse.builder()
                        .facultyId(facultyId)
                        .departmentId(departmentId)
                        .offeringId(offeringId)
                        .averageAssignmentScore(85.0)
                        .averageExamScore(78.5)
                        .passRatePercent(90.0)
                        .studentCount(50)
                        .build()
        );
    }
}
