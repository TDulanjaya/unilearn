package com.unilearn.server.service;

import com.unilearn.server.dto.response.PerformanceReportResponse;

import java.util.List;

/**
 * Service interface for generating performance reports.
 */
public interface PerformanceReportService {

    List<PerformanceReportResponse> generateReport(Long facultyId, Long departmentId, Long offeringId);
}
