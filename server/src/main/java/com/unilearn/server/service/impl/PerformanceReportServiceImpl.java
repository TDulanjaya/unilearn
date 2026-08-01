package com.unilearn.server.service.impl;

import com.unilearn.server.dto.response.PerformanceReportResponse;
import com.unilearn.server.dto.response.report.LabeledCountDTO;
import com.unilearn.server.service.PerformanceReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Arrays;
import java.util.Collections;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class PerformanceReportServiceImpl implements PerformanceReportService {

    @Override
    public List<PerformanceReportResponse> generateReport(Long facultyId, Long departmentId, Long offeringId) {
        List<LabeledCountDTO> gradeDistribution = Arrays.asList(
                LabeledCountDTO.builder().label("A").count(20).build(),
                LabeledCountDTO.builder().label("B").count(15).build(),
                LabeledCountDTO.builder().label("C").count(10).build(),
                LabeledCountDTO.builder().label("F").count(5).build()
        );

        return Collections.singletonList(
                PerformanceReportResponse.builder()
                        .facultyId(facultyId)
                        .departmentId(departmentId)
                        .offeringId(offeringId)
                        .averageAssignmentScore(85.0)
                        .averageExamScore(78.5)
                        .passRatePercent(90.0)
                        .studentCount(50)
                        .gradeDistribution(gradeDistribution)
                        .build()
        );
    }
}
