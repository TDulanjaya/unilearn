package com.unilearn.server.controller;

import com.unilearn.server.dto.request.enrollment.EnrollmentCreateRequestDTO;
import com.unilearn.server.dto.response.EnrollmentResponse;
import com.unilearn.server.dto.response.PageResponseDTO;
import com.unilearn.server.service.EnrollmentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/enrollments")
@RequiredArgsConstructor
public class EnrollmentController {

    private final EnrollmentService enrollmentService;

    @PostMapping
    @PreAuthorize("hasAnyRole('STUDENT', 'STAFF_ADMIN')")
    // TODO: If STUDENT, enforce self-enrollment only via authenticated principal
    public ResponseEntity<EnrollmentResponse> enrollStudent(
            @Valid @RequestBody EnrollmentCreateRequestDTO request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(enrollmentService.enrollStudent(request));
    }

    @PatchMapping("/{id}/withdraw")
    @PreAuthorize("hasAnyRole('STUDENT', 'STAFF_ADMIN')")
    // TODO: If STUDENT, enforce that the enrollment belongs to the authenticated student
    public ResponseEntity<Void> withdrawEnrollment(@PathVariable Long id) {
        enrollmentService.dropEnrollment(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/student/{studentId}")
    @PreAuthorize("hasAnyRole('STAFF_ADMIN', 'LECTURER', 'STUDENT')")
    // TODO: If STUDENT, enforce that studentId matches the authenticated student
    public ResponseEntity<List<EnrollmentResponse>> getEnrollmentsByStudent(@PathVariable Long studentId) {
        return ResponseEntity.ok(enrollmentService.getEnrollmentsByStudent(studentId));
    }

    @GetMapping("/offering/{offeringId}")
    @PreAuthorize("hasAnyRole('STAFF_ADMIN', 'LECTURER')")
    public ResponseEntity<PageResponseDTO<EnrollmentResponse>> getEnrollmentsByOffering(
            @PathVariable Long offeringId,
            @PageableDefault(size = 20) Pageable pageable) {
        return ResponseEntity.ok(enrollmentService.getEnrollmentsByOffering(offeringId, pageable));
    }
}
