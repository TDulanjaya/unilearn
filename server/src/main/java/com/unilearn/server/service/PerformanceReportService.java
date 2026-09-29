package com.unilearn.server.service;

import com.unilearn.server.dto.response.PerformanceReportResponse;

import java.util.List;

// Performance reports service
public interface PerformanceReportService {

    List<PerformanceReportResponse> generateReport(Long facultyId, Long departmentId, Long offeringId);
}
