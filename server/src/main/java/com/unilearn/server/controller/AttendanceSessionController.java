package com.unilearn.server.controller;

import com.unilearn.server.dto.request.AttendanceSessionRequest;
import com.unilearn.server.dto.response.AttendanceSessionResponse;
import com.unilearn.server.service.AttendanceSessionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/attendance-sessions")
@RequiredArgsConstructor
public class AttendanceSessionController {

    private final AttendanceSessionService attendanceSessionService;

    @PostMapping
    @PreAuthorize("hasRole('LECTURER')")
    public ResponseEntity<AttendanceSessionResponse> createSession(
            @Valid @RequestBody AttendanceSessionRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(attendanceSessionService.createSession(request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('LECTURER')")
    public ResponseEntity<Void> deleteSession(@PathVariable Long id) {
        attendanceSessionService.deleteSession(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/offering/{offeringId}")
    @PreAuthorize("hasAnyRole('LECTURER', 'STAFF_ADMIN', 'HOD_DEAN')")
    public ResponseEntity<List<AttendanceSessionResponse>> getSessionsByOffering(
            @PathVariable Long offeringId) {
        return ResponseEntity.ok(attendanceSessionService.getSessionsByOffering(offeringId));
    }
}
