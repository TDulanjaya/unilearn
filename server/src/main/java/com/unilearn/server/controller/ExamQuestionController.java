package com.unilearn.server.controller;

import com.unilearn.server.dto.response.ExamQuestionResponse;
import com.unilearn.server.service.ExamQuestionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/exams/{examId}/questions")
@RequiredArgsConstructor
public class ExamQuestionController {

    private final ExamQuestionService examQuestionService;

    @PostMapping("/{questionId}")
    @PreAuthorize("hasRole('LECTURER')")
    public ResponseEntity<ExamQuestionResponse> attachQuestion(@PathVariable Long examId,
                                                               @PathVariable Long questionId) {
        // Build the request from path variables
        com.unilearn.server.dto.request.ExamQuestionRequest request =
                new com.unilearn.server.dto.request.ExamQuestionRequest();
        request.setExamId(examId);
        request.setQuestionId(questionId);
        return ResponseEntity.status(HttpStatus.CREATED).body(examQuestionService.addQuestionToExam(request));
    }

    @DeleteMapping("/{questionId}")
    @PreAuthorize("hasRole('LECTURER')")
    public ResponseEntity<Void> detachQuestion(@PathVariable Long examId,
                                               @PathVariable Long questionId) {
        examQuestionService.removeQuestionFromExam(examId, questionId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('LECTURER', 'STUDENT')")
    public ResponseEntity<?> getQuestionsForExam(@PathVariable Long examId,
                                                 org.springframework.security.core.Authentication authentication) {
        if (authentication != null && authentication.getAuthorities().stream()
                .anyMatch(a -> "ROLE_STUDENT".equalsIgnoreCase(a.getAuthority()))) {
            return ResponseEntity.ok(examQuestionService.getStudentQuestionsForExam(examId));
        }
        return ResponseEntity.ok(examQuestionService.getQuestionsForExam(examId));
    }

    @PatchMapping("/reorder")
    @PreAuthorize("hasRole('LECTURER')")
    public ResponseEntity<List<ExamQuestionResponse>> reorderQuestions(
            @PathVariable Long examId,
            @RequestBody List<Long> questionIdsInOrder) {
        return ResponseEntity.ok(examQuestionService.reorderQuestions(examId, questionIdsInOrder));
    }
}
