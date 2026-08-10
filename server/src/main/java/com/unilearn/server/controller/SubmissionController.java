package com.unilearn.server.controller;

import com.unilearn.server.dto.request.submission.SubmissionCreateRequestDTO;
import com.unilearn.server.dto.request.submission.SubmissionGradeRequestDTO;
import com.unilearn.server.dto.response.SubmissionResponse;
import com.unilearn.server.service.SubmissionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import com.unilearn.server.model.User;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import java.util.List;

@RestController
@RequestMapping("/api/v1/submissions")
@RequiredArgsConstructor
public class SubmissionController {

    private final SubmissionService submissionService;

    @PostMapping
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<SubmissionResponse> submitAssignment(
            @AuthenticationPrincipal User principal,
            @Valid @RequestBody SubmissionCreateRequestDTO request) {
        request.setStudentId(principal.getUserId());
        return ResponseEntity.status(HttpStatus.CREATED).body(submissionService.submitAssignment(request));
    }

    @PatchMapping("/{id}/grade")
    @PreAuthorize("hasRole('LECTURER')")
    public ResponseEntity<SubmissionResponse> gradeSubmission(
            @PathVariable Long id,
            @Valid @RequestBody SubmissionGradeRequestDTO gradeRequest) {
        return ResponseEntity.ok(submissionService.gradeSubmission(id, gradeRequest));
    }

    @GetMapping("/assignment/{assignmentId}")
    @PreAuthorize("hasRole('LECTURER')")
    public ResponseEntity<List<SubmissionResponse>> getSubmissionsByAssignment(
            @PathVariable Long assignmentId) {
        return ResponseEntity.ok(submissionService.getSubmissionsByAssignment(assignmentId));
    }

    @GetMapping("/student/{studentId}")
    @PreAuthorize("hasAnyRole('LECTURER', 'STUDENT')")
    public ResponseEntity<List<SubmissionResponse>> getSubmissionsByStudent(
            @AuthenticationPrincipal User principal,
            @PathVariable Long studentId) {
        if ("student".equalsIgnoreCase(principal.getRole()) && !studentId.equals(principal.getUserId())) {
            throw new AccessDeniedException("Access denied: Students can only access their own submissions");
        }
        return ResponseEntity.ok(submissionService.getSubmissionsByStudent(studentId));
    }
}
