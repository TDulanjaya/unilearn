package com.unilearn.server.service;

import com.unilearn.server.dto.response.EnrollmentReportResponse;

import java.util.List;

/**
 * Service interface for generating enrollment reports.
 */
public interface EnrollmentReportService {

    List<EnrollmentReportResponse> generateReport(Long facultyId, Long departmentId, Long courseId);
}
