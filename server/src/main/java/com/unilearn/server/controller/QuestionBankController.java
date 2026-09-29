package com.unilearn.server.controller;

import com.unilearn.server.dto.request.QuestionBankRequest;
import com.unilearn.server.dto.response.QuestionBankResponse;
import com.unilearn.server.service.QuestionBankService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/question-banks")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('LECTURER', 'STAFF_ADMIN', 'SUPER_ADMIN', 'HOD_DEAN')")
public class QuestionBankController {

    private final QuestionBankService questionBankService;

    @PostMapping
    public ResponseEntity<QuestionBankResponse> createQuestionBank(
            @Valid @RequestBody QuestionBankRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(questionBankService.createQuestionBank(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<QuestionBankResponse> updateQuestionBank(
            @PathVariable Long id,
            @Valid @RequestBody QuestionBankRequest request) {
        return ResponseEntity.ok(questionBankService.updateQuestionBank(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteQuestionBank(@PathVariable Long id) {
        questionBankService.deleteQuestionBank(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}")
    public ResponseEntity<QuestionBankResponse> getQuestionBankById(@PathVariable Long id) {
        return ResponseEntity.ok(questionBankService.getBankById(id));
    }

    @GetMapping("/course/{courseId}")
    public ResponseEntity<List<QuestionBankResponse>> getQuestionBanksByCourse(@PathVariable Long courseId) {
        return ResponseEntity.ok(questionBankService.getBanksByCourse(courseId));
    }
}
