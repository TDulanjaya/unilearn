package com.unilearn.server.controller;

import com.unilearn.server.dto.request.SemesterRequest;
import com.unilearn.server.dto.response.SemesterResponse;
import com.unilearn.server.service.SemesterService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/semesters")
@RequiredArgsConstructor
public class SemesterController {

    private final SemesterService semesterService;

    @PostMapping
    @PreAuthorize("hasRole('STAFF_ADMIN')")
    public ResponseEntity<SemesterResponse> createSemester(@Valid @RequestBody SemesterRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(semesterService.createSemester(request));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('STAFF_ADMIN')")
    public ResponseEntity<SemesterResponse> updateSemester(@PathVariable Long id,
                                                           @Valid @RequestBody SemesterRequest request) {
        return ResponseEntity.ok(semesterService.updateSemester(id, request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('STAFF_ADMIN')")
    public ResponseEntity<Void> deleteSemester(@PathVariable Long id) {
        semesterService.deleteSemester(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}")
    public ResponseEntity<SemesterResponse> getSemesterById(@PathVariable Long id) {
        return ResponseEntity.ok(semesterService.getSemesterById(id));
    }

    @GetMapping("/academic-year/{academicYearId}")
    public ResponseEntity<List<SemesterResponse>> getSemestersByAcademicYear(@PathVariable Long academicYearId) {
        return ResponseEntity.ok(semesterService.getSemestersByAcademicYear(academicYearId));
    }
}
