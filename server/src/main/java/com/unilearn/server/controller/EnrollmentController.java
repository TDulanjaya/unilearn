package com.unilearn.server.controller;

import com.unilearn.server.dto.request.enrollment.BatchEnrollRequest;
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

import com.unilearn.server.model.User;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import java.util.List;

@RestController
@RequestMapping("/api/v1/enrollments")
@RequiredArgsConstructor
public class EnrollmentController {

    private final EnrollmentService enrollmentService;

    @PostMapping
    @PreAuthorize("hasAnyRole('STUDENT', 'STAFF_ADMIN')")
    public ResponseEntity<EnrollmentResponse> enrollStudent(
            @AuthenticationPrincipal User principal,
            @Valid @RequestBody EnrollmentCreateRequestDTO request) {
        if ("student".equalsIgnoreCase(principal.getRole())) {
            request.setStudentId(principal.getUserId());
        }
        return ResponseEntity.status(HttpStatus.CREATED).body(enrollmentService.enrollStudent(request));
    }

    @PatchMapping("/{id}/withdraw")
    @PreAuthorize("hasAnyRole('STUDENT', 'STAFF_ADMIN')")
    public ResponseEntity<Void> withdrawEnrollment(
            @AuthenticationPrincipal User principal,
            @PathVariable Long id) {
        Long currentUserId = "student".equalsIgnoreCase(principal.getRole()) ? principal.getUserId() : null;
        enrollmentService.dropEnrollment(id, currentUserId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/student/{studentId}")
    @PreAuthorize("hasAnyRole('STAFF_ADMIN', 'LECTURER', 'STUDENT')")
    public ResponseEntity<List<EnrollmentResponse>> getEnrollmentsByStudent(
            @AuthenticationPrincipal User principal,
            @PathVariable Long studentId) {
        if ("student".equalsIgnoreCase(principal.getRole()) && !studentId.equals(principal.getUserId())) {
            throw new AccessDeniedException("Access denied: Students can only access their own enrollments");
        }
        return ResponseEntity.ok(enrollmentService.getEnrollmentsByStudent(studentId));
    }

    @GetMapping("/offering/{offeringId}")
    @PreAuthorize("hasAnyRole('STAFF_ADMIN', 'LECTURER')")
    public ResponseEntity<PageResponseDTO<EnrollmentResponse>> getEnrollmentsByOffering(
            @PathVariable Long offeringId,
            @PageableDefault(size = 20) Pageable pageable) {
        return ResponseEntity.ok(enrollmentService.getEnrollmentsByOffering(offeringId, pageable));
    }

    // Enroll batch into single course offering
    @PostMapping("/batch/{batchId}/offering/{offeringId}")
    @PreAuthorize("hasRole('STAFF_ADMIN')")
    public ResponseEntity<java.util.Map<String, Object>> enrollBatch(
            @PathVariable Long batchId,
            @PathVariable Long offeringId) {
        return ResponseEntity.ok(enrollmentService.enrollBatch(batchId, offeringId));
    }

    // Enroll batch into multiple course offerings
    @PostMapping("/batch/{batchId}")
    @PreAuthorize("hasRole('STAFF_ADMIN')")
    public ResponseEntity<java.util.Map<String, Object>> enrollBatchMultiple(
            @PathVariable Long batchId,
            @Valid @RequestBody BatchEnrollRequest request) {
        return ResponseEntity.ok(enrollmentService.enrollBatchMultiple(batchId, request.getOfferingIds()));
    }
}
