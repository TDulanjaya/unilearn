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

import java.util.List;

@RestController
@RequestMapping("/api/v1/exam-attempts")
@RequiredArgsConstructor
public class ExamAttemptController {

    private final ExamAttemptService examAttemptService;

    @PostMapping
    @PreAuthorize("hasRole('STUDENT')")
    // TODO: Enforce self-only — derive studentId from authenticated principal
    public ResponseEntity<ExamAttemptResponse> startAttempt(
            @Valid @RequestBody ExamAttemptStartRequestDTO request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(examAttemptService.startAttempt(request));
    }

    @PatchMapping("/{id}/complete")
    @PreAuthorize("hasRole('STUDENT')")
    // TODO: Enforce self-only — verify the attempt belongs to the authenticated student
    public ResponseEntity<ExamAttemptResponse> completeAttempt(@PathVariable Long id) {
        return ResponseEntity.ok(examAttemptService.submitAttempt(id));
    }

    @GetMapping("/exam/{examId}")
    @PreAuthorize("hasRole('LECTURER')")
    public ResponseEntity<List<ExamAttemptResponse>> getAttemptsByExam(@PathVariable Long examId) {
        return ResponseEntity.ok(examAttemptService.getAttemptsByExam(examId));
    }

    @GetMapping("/student/{studentId}")
    @PreAuthorize("hasAnyRole('LECTURER', 'STUDENT')")
    // TODO: If STUDENT, enforce that studentId matches the authenticated student
    public ResponseEntity<List<ExamAttemptResponse>> getAttemptsByStudent(@PathVariable Long studentId) {
        return ResponseEntity.ok(examAttemptService.getAttemptsByStudent(studentId));
    }
}
