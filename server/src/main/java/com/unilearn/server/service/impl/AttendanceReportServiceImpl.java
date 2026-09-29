package com.unilearn.server.service.impl;

import com.unilearn.server.dto.response.AttendanceReportResponse;
import com.unilearn.server.dto.response.report.LabeledCountDTO;
import com.unilearn.server.dto.response.report.MonthlyPointDTO;
import com.unilearn.server.repository.AttendanceRecordRepository;
import com.unilearn.server.service.AttendanceReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Arrays;
import java.util.Collections;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AttendanceReportServiceImpl implements AttendanceReportService {

    private final AttendanceRecordRepository attendanceRecordRepository;
    private final com.unilearn.server.security.OwnershipValidator ownershipValidator;

    @Override
    public List<AttendanceReportResponse> generateReport(Long facultyId, Long departmentId, Long offeringId) {
        if (offeringId != null) {
            ownershipValidator.checkLecturerOfferingAccess(offeringId);
        }
        if (departmentId != null) {
            ownershipValidator.checkHodDepartmentAccess(departmentId);
        }
        List<MonthlyPointDTO> trend = Arrays.asList(
                MonthlyPointDTO.builder().month("2026-05").value(82.0).build(),
                MonthlyPointDTO.builder().month("2026-06").value(85.0).build(),
                MonthlyPointDTO.builder().month("2026-07").value(80.0).build()
        );

        List<LabeledCountDTO> byCourse = Arrays.asList(
                LabeledCountDTO.builder().label("CS101").count(45).build(),
                LabeledCountDTO.builder().label("SE201").count(35).build()
        );

        return Collections.singletonList(
                AttendanceReportResponse.builder()
                        .facultyId(facultyId)
                        .departmentId(departmentId)
                        .offeringId(offeringId)
                        .totalSessions(10)
                        .presentCount(8)
                        .absentCount(1)
                        .lateCount(1)
                        .attendanceRatePercent(80.0)
                        .attendanceTrend(trend)
                        .byCourse(byCourse)
                        .build()
        );
    }
}
