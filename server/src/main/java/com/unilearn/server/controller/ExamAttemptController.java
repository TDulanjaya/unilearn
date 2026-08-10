package com.unilearn.server.controller;

import com.unilearn.server.dto.request.examattempt.ExamAttemptStartRequestDTO;
import com.unilearn.server.dto.response.ExamAttemptResponse;
import com.unilearn.server.service.ExamAttemptService;
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
@RequestMapping("/api/v1/exam-attempts")
@RequiredArgsConstructor
public class ExamAttemptController {

    private final ExamAttemptService examAttemptService;

    @PostMapping
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<ExamAttemptResponse> startAttempt(
            @AuthenticationPrincipal User principal,
            @Valid @RequestBody ExamAttemptStartRequestDTO request) {
        request.setStudentId(principal.getUserId());
        return ResponseEntity.status(HttpStatus.CREATED).body(examAttemptService.startAttempt(request));
    }

    @PatchMapping("/{id}/complete")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<ExamAttemptResponse> completeAttempt(
            @AuthenticationPrincipal User principal,
            @PathVariable Long id) {
        return ResponseEntity.ok(examAttemptService.submitAttempt(id, principal.getUserId()));
    }

    @GetMapping("/exam/{examId}")
    @PreAuthorize("hasRole('LECTURER')")
    public ResponseEntity<List<ExamAttemptResponse>> getAttemptsByExam(@PathVariable Long examId) {
        return ResponseEntity.ok(examAttemptService.getAttemptsByExam(examId));
    }

    @GetMapping("/student/{studentId}")
    @PreAuthorize("hasAnyRole('LECTURER', 'STUDENT')")
    public ResponseEntity<List<ExamAttemptResponse>> getAttemptsByStudent(
            @AuthenticationPrincipal User principal,
            @PathVariable Long studentId) {
        if ("student".equalsIgnoreCase(principal.getRole()) && !studentId.equals(principal.getUserId())) {
            throw new AccessDeniedException("Access denied: Students can only access their own exam attempts");
        }
        return ResponseEntity.ok(examAttemptService.getAttemptsByStudent(studentId));
    }
}
