package com.unilearn.server.controller;

import com.unilearn.server.dto.response.AttendanceReportResponse;
import com.unilearn.server.service.AttendanceReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/reports/attendance")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('STAFF_ADMIN', 'HOD_DEAN', 'LECTURER')")
public class AttendanceReportController {

    private final AttendanceReportService attendanceReportService;

    @GetMapping
    public ResponseEntity<List<AttendanceReportResponse>> getAttendanceReport(
            @RequestParam(required = false) Long facultyId,
            @RequestParam(required = false) Long departmentId,
            @RequestParam(required = false) Long offeringId) {
        return ResponseEntity.ok(attendanceReportService.generateReport(facultyId, departmentId, offeringId));
    }
}
