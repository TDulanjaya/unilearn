package com.unilearn.server.controller;

import com.unilearn.server.dto.request.ExaminerRequest;
import com.unilearn.server.dto.response.ExaminerResponse;
import com.unilearn.server.service.ExaminerService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/examiners")
@RequiredArgsConstructor
public class ExaminerController {

    private final ExaminerService examinerService;

    @PostMapping
    @PreAuthorize("hasRole('STAFF_ADMIN')")
    public ResponseEntity<ExaminerResponse> createExaminer(@Valid @RequestBody ExaminerRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(examinerService.createExaminer(request));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('STAFF_ADMIN')")
    public ResponseEntity<ExaminerResponse> updateExaminer(@PathVariable Long id,
                                                           @Valid @RequestBody ExaminerRequest request) {
        return ResponseEntity.ok(examinerService.updateExaminer(id, request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('STAFF_ADMIN')")
    public ResponseEntity<Void> deleteExaminer(@PathVariable Long id) {
        examinerService.deleteExaminer(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('STAFF_ADMIN', 'HOD_DEAN')")
    public ResponseEntity<ExaminerResponse> getExaminerById(@PathVariable Long id) {
        return ResponseEntity.ok(examinerService.getExaminerById(id));
    }

    @GetMapping("/department/{departmentId}")
    @PreAuthorize("hasAnyRole('STAFF_ADMIN', 'HOD_DEAN')")
    public ResponseEntity<List<ExaminerResponse>> getExaminersByDepartment(@PathVariable Long departmentId) {
        return ResponseEntity.ok(examinerService.getExaminersByDepartment(departmentId));
    }

    @PostMapping("/{examinerId}/assign-exam/{examId}")
    @PreAuthorize("hasRole('STAFF_ADMIN')")
    public ResponseEntity<Void> assignExaminerToExam(@PathVariable Long examinerId,
                                                     @PathVariable Long examId) {
        examinerService.assignExaminerToExam(examinerId, examId);
        return ResponseEntity.ok().build();
    }
}
