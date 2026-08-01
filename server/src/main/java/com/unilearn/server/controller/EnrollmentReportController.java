package com.unilearn.server.controller;

import com.unilearn.server.dto.response.EnrollmentReportResponse;
import com.unilearn.server.service.EnrollmentReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/reports/enrollment")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('STAFF_ADMIN', 'HOD_DEAN')")
public class EnrollmentReportController {

    private final EnrollmentReportService enrollmentReportService;

    @GetMapping
    public ResponseEntity<List<EnrollmentReportResponse>> getEnrollmentReport(
            @RequestParam(required = false) Long facultyId,
            @RequestParam(required = false) Long departmentId,
            @RequestParam(required = false) Long courseId) {
        return ResponseEntity.ok(enrollmentReportService.generateReport(facultyId, departmentId, courseId));
    }
}
