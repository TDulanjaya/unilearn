package com.unilearn.server.controller;

import com.unilearn.server.dto.request.AttendanceBulkMarkRequest;
import com.unilearn.server.dto.request.AttendanceRecordRequest;
import com.unilearn.server.dto.request.StudentCheckInRequest;
import com.unilearn.server.dto.response.AttendanceRecordResponse;
import com.unilearn.server.service.AttendanceRecordService;
import com.unilearn.server.repository.UserRepository;
import com.unilearn.server.model.User;
import com.unilearn.server.exception.EntryNotFoundException;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/attendance-records")
@RequiredArgsConstructor
public class AttendanceRecordController {

    private final AttendanceRecordService attendanceRecordService;
    private final UserRepository userRepository;

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

    @PostMapping("/check-in")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<AttendanceRecordResponse> checkIn(
            @AuthenticationPrincipal User principal,
            @Valid @RequestBody StudentCheckInRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(attendanceRecordService.checkIn(request.getSessionCode(), principal.getUserId()));
    }

    @GetMapping("/student/{studentId}")
    @PreAuthorize("hasAnyRole('STUDENT', 'LECTURER', 'STAFF_ADMIN', 'HOD_DEAN')")
    public ResponseEntity<List<AttendanceRecordResponse>> getRecordsByStudent(
            @AuthenticationPrincipal User principal,
            @PathVariable Long studentId) {
        if ("student".equalsIgnoreCase(principal.getRole()) && !studentId.equals(principal.getUserId())) {
            throw new org.springframework.security.access.AccessDeniedException("Access denied: Students can only access their own attendance records");
        }
        return ResponseEntity.ok(attendanceRecordService.getAttendanceForStudent(studentId));
    }
}
