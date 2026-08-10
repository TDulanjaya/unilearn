package com.unilearn.server.controller;

import com.unilearn.server.dto.response.ExamResultResponse;
import com.unilearn.server.service.ExamResultService;
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
@RequestMapping("/api/v1/exam-results")
@RequiredArgsConstructor
public class ExamResultController {

    private final ExamResultService examResultService;

    @PostMapping("/attempt/{attemptId}/compute")
    @PreAuthorize("hasRole('LECTURER')")
    public ResponseEntity<ExamResultResponse> computeAndPublishResult(
            @PathVariable Long attemptId,
            @RequestParam Long examId,
            @RequestParam Long studentId) {
        // Uses publishResultForStudent which computes + publishes
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(examResultService.publishResultForStudent(examId, studentId));
    }

    @PatchMapping("/{id}/publish")
    @PreAuthorize("hasRole('LECTURER')")
    public ResponseEntity<List<ExamResultResponse>> publishAllResultsForExam(
            @PathVariable Long id) {
        return ResponseEntity.ok(examResultService.publishAllResultsForExam(id));
    }

    @GetMapping("/exam/{examId}")
    @PreAuthorize("hasRole('LECTURER')")
    public ResponseEntity<List<ExamResultResponse>> getResultsByExam(@PathVariable Long examId) {
        return ResponseEntity.ok(examResultService.getResultsForExam(examId));
    }

    @GetMapping("/student/{studentId}")
    @PreAuthorize("hasAnyRole('LECTURER', 'STUDENT')")
    public ResponseEntity<ExamResultResponse> getResultsByStudent(
            @AuthenticationPrincipal User principal,
            @PathVariable Long studentId,
            @RequestParam Long examId) {
        if ("student".equalsIgnoreCase(principal.getRole()) && !studentId.equals(principal.getUserId())) {
            throw new AccessDeniedException("Access denied: Students can only access their own results");
        }
        return ResponseEntity.ok(examResultService.getResultForStudent(examId, studentId));
    }
}
