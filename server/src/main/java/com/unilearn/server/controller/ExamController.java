package com.unilearn.server.controller;

import com.unilearn.server.dto.request.ExamRequest;
import com.unilearn.server.dto.request.exam.ExamFinalCreateRequestDTO;
import com.unilearn.server.dto.request.exam.ExamInClassCreateRequestDTO;
import com.unilearn.server.dto.response.ExamResponse;
import com.unilearn.server.service.ExamService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/exams")
@RequiredArgsConstructor
public class ExamController {

    private final ExamService examService;

    @PostMapping("/final")
    @PreAuthorize("hasRole('EXAMINER')")
    public ResponseEntity<ExamResponse> createFinalExam(@Valid @RequestBody ExamFinalCreateRequestDTO request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(examService.createFinalExam(request));
    }

    @PostMapping("/inclass")
    @PreAuthorize("hasRole('LECTURER')")
    public ResponseEntity<ExamResponse> createInClassExam(@Valid @RequestBody ExamInClassCreateRequestDTO request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(examService.createInClassExam(request));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('EXAMINER', 'LECTURER')")
    // Note: EXAMINER can update final exams, LECTURER can update in-class exams.
    // Enforcing "owner of the exam" check should be done in the service layer.
    public ResponseEntity<ExamResponse> updateExam(@PathVariable Long id,
                                                   @Valid @RequestBody ExamRequest request) {
        return ResponseEntity.ok(examService.updateExam(id, request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('EXAMINER', 'LECTURER')")
    // Note: Same owner-based authorization as updateExam above
    public ResponseEntity<Void> deleteExam(@PathVariable Long id) {
        examService.deleteExam(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}")
    public ResponseEntity<ExamResponse> getExamById(@PathVariable Long id) {
        return ResponseEntity.ok(examService.getExamById(id));
    }

    @GetMapping("/offering/{offeringId}")
    public ResponseEntity<List<ExamResponse>> getExamsByOffering(@PathVariable Long offeringId) {
        return ResponseEntity.ok(examService.getExamsByOffering(offeringId));
    }
}
