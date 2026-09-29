package com.unilearn.server.service;

import com.unilearn.server.dto.response.EnrollmentReportResponse;

import java.util.List;

// Enrollment reports service
public interface EnrollmentReportService {

    List<EnrollmentReportResponse> generateReport(Long facultyId, Long departmentId, Long courseId);
}
