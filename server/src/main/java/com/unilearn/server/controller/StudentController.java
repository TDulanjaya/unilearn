package com.unilearn.server.controller;

import com.unilearn.server.dto.request.StudentRequest;
import com.unilearn.server.dto.response.PageResponseDTO;
import com.unilearn.server.dto.response.StudentResponse;
import com.unilearn.server.service.StudentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/students")
@RequiredArgsConstructor
public class StudentController {

    private final StudentService studentService;

    @PostMapping
    @PreAuthorize("hasRole('STAFF_ADMIN')")
    public ResponseEntity<StudentResponse> createStudent(@Valid @RequestBody StudentRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(studentService.createStudent(request));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('STAFF_ADMIN')")
    // TODO: Also allow the student themself — enforce by comparing authenticated principal's email
    //       against the student's linked user. Requires a custom SpEL expression or service-layer check.
    public ResponseEntity<StudentResponse> updateStudent(@PathVariable Long id,
                                                         @Valid @RequestBody StudentRequest request) {
        return ResponseEntity.ok(studentService.updateStudent(id, request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('STAFF_ADMIN')")
    public ResponseEntity<Void> deleteStudent(@PathVariable Long id) {
        studentService.deleteStudent(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('STAFF_ADMIN', 'HOD_DEAN', 'LECTURER')")
    public ResponseEntity<StudentResponse> getStudentById(@PathVariable Long id) {
        return ResponseEntity.ok(studentService.getStudentById(id));
    }

    @GetMapping("/batch/{batchId}")
    @PreAuthorize("hasAnyRole('STAFF_ADMIN', 'HOD_DEAN', 'LECTURER')")
    public ResponseEntity<PageResponseDTO<StudentResponse>> getStudentsByBatch(
            @PathVariable Long batchId,
            @PageableDefault(size = 20) Pageable pageable) {
        return ResponseEntity.ok(studentService.getStudentsByBatch(batchId, pageable));
    }

    @GetMapping("/department/{departmentId}")
    @PreAuthorize("hasAnyRole('STAFF_ADMIN', 'HOD_DEAN', 'LECTURER')")
    public ResponseEntity<PageResponseDTO<StudentResponse>> getStudentsByDepartment(
            @PathVariable Long departmentId,
            @PageableDefault(size = 20) Pageable pageable) {
        return ResponseEntity.ok(studentService.getStudentsByDepartment(departmentId, pageable));
    }
}
