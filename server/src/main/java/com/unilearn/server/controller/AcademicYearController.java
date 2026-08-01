package com.unilearn.server.controller;

import com.unilearn.server.dto.request.AcademicYearRequest;
import com.unilearn.server.dto.response.AcademicYearResponse;
import com.unilearn.server.dto.response.PageResponseDTO;
import com.unilearn.server.service.AcademicYearService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/academic-years")
@RequiredArgsConstructor
public class AcademicYearController {

    private final AcademicYearService academicYearService;

    @PostMapping
    @PreAuthorize("hasRole('STAFF_ADMIN')")
    public ResponseEntity<AcademicYearResponse> createAcademicYear(@Valid @RequestBody AcademicYearRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(academicYearService.createAcademicYear(request));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('STAFF_ADMIN')")
    public ResponseEntity<AcademicYearResponse> updateAcademicYear(@PathVariable Long id,
                                                                   @Valid @RequestBody AcademicYearRequest request) {
        return ResponseEntity.ok(academicYearService.updateAcademicYear(id, request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('STAFF_ADMIN')")
    public ResponseEntity<Void> deleteAcademicYear(@PathVariable Long id) {
        academicYearService.deleteAcademicYear(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}")
    public ResponseEntity<AcademicYearResponse> getAcademicYearById(@PathVariable Long id) {
        return ResponseEntity.ok(academicYearService.getAcademicYearById(id));
    }

    @GetMapping
    public ResponseEntity<PageResponseDTO<AcademicYearResponse>> getAllAcademicYears(
            @PageableDefault(size = 20) Pageable pageable) {
        return ResponseEntity.ok(academicYearService.getAllAcademicYears(pageable));
    }

    @PatchMapping("/{id}/set-current")
    @PreAuthorize("hasRole('STAFF_ADMIN')")
    public ResponseEntity<AcademicYearResponse> setCurrentAcademicYear(@PathVariable Long id) {
        return ResponseEntity.ok(academicYearService.setCurrentAcademicYear(id));
    }
}
