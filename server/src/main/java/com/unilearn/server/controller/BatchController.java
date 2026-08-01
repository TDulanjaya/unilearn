package com.unilearn.server.controller;

import com.unilearn.server.dto.request.BatchRequest;
import com.unilearn.server.dto.response.BatchResponse;
import com.unilearn.server.dto.response.PageResponseDTO;
import com.unilearn.server.dto.response.StudentResponse;
import com.unilearn.server.service.BatchService;
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
@RequestMapping("/api/v1/batches")
@RequiredArgsConstructor
public class BatchController {

    private final BatchService batchService;

    @PostMapping
    @PreAuthorize("hasRole('STAFF_ADMIN')")
    public ResponseEntity<BatchResponse> createBatch(@Valid @RequestBody BatchRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(batchService.createBatch(request));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('STAFF_ADMIN')")
    public ResponseEntity<BatchResponse> updateBatch(@PathVariable Long id,
                                                     @Valid @RequestBody BatchRequest request) {
        return ResponseEntity.ok(batchService.updateBatch(id, request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('STAFF_ADMIN')")
    public ResponseEntity<Void> deleteBatch(@PathVariable Long id) {
        batchService.deleteBatch(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('STAFF_ADMIN', 'HOD_DEAN', 'LECTURER')")
    public ResponseEntity<BatchResponse> getBatchById(@PathVariable Long id) {
        return ResponseEntity.ok(batchService.getBatchById(id));
    }

    @GetMapping("/department/{departmentId}")
    @PreAuthorize("hasAnyRole('STAFF_ADMIN', 'HOD_DEAN', 'LECTURER')")
    public ResponseEntity<List<BatchResponse>> getBatchesByDepartment(@PathVariable Long departmentId) {
        return ResponseEntity.ok(batchService.getBatchesByDepartment(departmentId));
    }

    @GetMapping("/{id}/students")
    @PreAuthorize("hasAnyRole('STAFF_ADMIN', 'HOD_DEAN', 'LECTURER')")
    public ResponseEntity<PageResponseDTO<StudentResponse>> getStudentsInBatch(
            @PathVariable Long id,
            @PageableDefault(size = 20) Pageable pageable) {
        return ResponseEntity.ok(batchService.getStudentsInBatch(id, pageable));
    }
}
