package com.unilearn.server.service.impl;

import com.unilearn.server.dto.response.AttendanceReportResponse;
import com.unilearn.server.repository.AttendanceRecordRepository;
import com.unilearn.server.service.AttendanceReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AttendanceReportServiceImpl implements AttendanceReportService {

    private final AttendanceRecordRepository attendanceRecordRepository;

    @Override
    public List<AttendanceReportResponse> generateReport(Long facultyId, Long departmentId, Long offeringId) {
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
                        .build()
        );
    }
}
