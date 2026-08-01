package com.unilearn.server.controller;

import com.unilearn.server.dto.request.FacultyRequest;
import com.unilearn.server.dto.response.FacultyResponse;
import com.unilearn.server.dto.response.PageResponseDTO;
import com.unilearn.server.service.FacultyService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/faculties")
@RequiredArgsConstructor
public class FacultyController {

    private final FacultyService facultyService;

    @PostMapping
    @PreAuthorize("hasRole('STAFF_ADMIN')")
    public ResponseEntity<FacultyResponse> createFaculty(@Valid @RequestBody FacultyRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(facultyService.createFaculty(request));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('STAFF_ADMIN')")
    public ResponseEntity<FacultyResponse> updateFaculty(@PathVariable Long id,
                                                         @Valid @RequestBody FacultyRequest request) {
        return ResponseEntity.ok(facultyService.updateFaculty(id, request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('STAFF_ADMIN')")
    public ResponseEntity<Void> deleteFaculty(@PathVariable Long id) {
        facultyService.deleteFaculty(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}")
    public ResponseEntity<FacultyResponse> getFacultyById(@PathVariable Long id) {
        return ResponseEntity.ok(facultyService.getFacultyById(id));
    }

    @GetMapping
    public ResponseEntity<PageResponseDTO<FacultyResponse>> getAllFaculties(
            @PageableDefault(size = 20) Pageable pageable) {
        return ResponseEntity.ok(facultyService.getAllFaculties(pageable));
    }
}
