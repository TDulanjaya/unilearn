package com.unilearn.server.controller;

import com.unilearn.server.dto.request.DepartmentRequest;
import com.unilearn.server.dto.response.DepartmentResponse;
import com.unilearn.server.dto.response.PageResponseDTO;
import com.unilearn.server.service.DepartmentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/departments")
@RequiredArgsConstructor
public class DepartmentController {

    private final DepartmentService departmentService;

    @PostMapping
    @PreAuthorize("hasAnyRole('STAFF_ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<DepartmentResponse> createDepartment(@Valid @RequestBody DepartmentRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(departmentService.createDepartment(request));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('STAFF_ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<DepartmentResponse> updateDepartment(@PathVariable Long id,
                                                               @Valid @RequestBody DepartmentRequest request) {
        return ResponseEntity.ok(departmentService.updateDepartment(id, request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('STAFF_ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<Void> deleteDepartment(@PathVariable Long id) {
        departmentService.deleteDepartment(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<DepartmentResponse> getDepartmentById(@PathVariable Long id) {
        return ResponseEntity.ok(departmentService.getDepartmentById(id));
    }

    @GetMapping("/faculty/{facultyId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<DepartmentResponse>> getDepartmentsByFaculty(@PathVariable Long facultyId) {
        return ResponseEntity.ok(departmentService.getDepartmentsByFaculty(facultyId));
    }

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<PageResponseDTO<DepartmentResponse>> getAllDepartments(
            @PageableDefault(size = 20) Pageable pageable) {
        return ResponseEntity.ok(departmentService.getAllDepartments(pageable));
    }
}
