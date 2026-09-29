package com.unilearn.server.service;

import com.unilearn.server.dto.response.AttendanceReportResponse;

import java.util.List;

// Attendance reports service
public interface AttendanceReportService {

    List<AttendanceReportResponse> generateReport(Long facultyId, Long departmentId, Long offeringId);
}
