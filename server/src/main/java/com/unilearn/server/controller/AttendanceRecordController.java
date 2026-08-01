package com.unilearn.server.controller;

import com.unilearn.server.dto.request.AttendanceBulkMarkRequest;
import com.unilearn.server.dto.request.AttendanceRecordRequest;
import com.unilearn.server.dto.response.AttendanceRecordResponse;
import com.unilearn.server.service.AttendanceRecordService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/attendance-records")
@RequiredArgsConstructor
public class AttendanceRecordController {

    private final AttendanceRecordService attendanceRecordService;

    @PostMapping
    @PreAuthorize("hasRole('LECTURER')")
    public ResponseEntity<AttendanceRecordResponse> markAttendance(
            @Valid @RequestBody AttendanceRecordRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(attendanceRecordService.markAttendance(request));
    }

    @PostMapping("/bulk")
    @PreAuthorize("hasRole('LECTURER')")
    public ResponseEntity<List<AttendanceRecordResponse>> markAttendanceBulk(
            @Valid @RequestBody AttendanceBulkMarkRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(attendanceRecordService.bulkMarkAttendance(request));
    }

    @GetMapping("/session/{sessionId}")
    @PreAuthorize("hasRole('LECTURER')")
    public ResponseEntity<List<AttendanceRecordResponse>> getRecordsBySession(@PathVariable Long sessionId) {
        return ResponseEntity.ok(attendanceRecordService.getAttendanceForSession(sessionId));
    }

    // TODO: GET /student/{studentId}/offering/{offeringId}/percentage
    //       AttendanceRecordService does not have getAttendancePercentage() yet.
    //       Add it to the service interface when ready.
}
