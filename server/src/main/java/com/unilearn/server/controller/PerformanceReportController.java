package com.unilearn.server.controller;

import com.unilearn.server.dto.response.PerformanceReportResponse;
import com.unilearn.server.service.PerformanceReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/reports/performance")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('STAFF_ADMIN', 'SUPER_ADMIN', 'HOD_DEAN', 'LECTURER')")
public class PerformanceReportController {

    private final PerformanceReportService performanceReportService;

    @GetMapping
    // Generate performance report
    public ResponseEntity<List<PerformanceReportResponse>> getPerformanceReport(
            @RequestParam(required = false) Long facultyId,
            @RequestParam(required = false) Long departmentId,
            @RequestParam(required = false) Long offeringId) {
        return ResponseEntity.ok(performanceReportService.generateReport(facultyId, departmentId, offeringId));
    }
}
