package com.unilearn.server.controller;

import com.unilearn.server.dto.request.ExamAnswerRequest;
import com.unilearn.server.dto.response.ExamAnswerResponse;
import com.unilearn.server.service.ExamAnswerService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import com.unilearn.server.model.User;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/v1/exam-answers")
@RequiredArgsConstructor
public class ExamAnswerController {

    private final ExamAnswerService examAnswerService;

    @PostMapping
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<ExamAnswerResponse> saveAnswer(
            @AuthenticationPrincipal User principal,
            @Valid @RequestBody ExamAnswerRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(examAnswerService.saveAnswer(request, principal.getUserId()));
    }

    @PatchMapping("/{id}/grade")
    @PreAuthorize("hasRole('LECTURER')")
    public ResponseEntity<ExamAnswerResponse> gradeAnswerManually(
            @PathVariable Long id,
            @RequestParam Long questionId,
            @RequestParam BigDecimal marksAwarded) {
        return ResponseEntity.ok(examAnswerService.gradeAnswer(id, questionId, marksAwarded));
    }

    @GetMapping("/attempt/{attemptId}")
    @PreAuthorize("hasAnyRole('LECTURER', 'STUDENT')")
    public ResponseEntity<List<ExamAnswerResponse>> getAnswersByAttempt(
            @AuthenticationPrincipal User principal,
            @PathVariable Long attemptId) {
        Long studentId = "student".equalsIgnoreCase(principal.getRole()) ? principal.getUserId() : null;
        return ResponseEntity.ok(examAnswerService.getAnswersForAttempt(attemptId, studentId));
    }
}
