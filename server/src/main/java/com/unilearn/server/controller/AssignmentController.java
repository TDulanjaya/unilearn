package com.unilearn.server.controller;

import com.unilearn.server.dto.request.AssignmentRequest;
import com.unilearn.server.dto.response.AssignmentResponse;
import com.unilearn.server.service.AssignmentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/assignments")
@RequiredArgsConstructor
public class AssignmentController {

    private final AssignmentService assignmentService;

    @PostMapping
    @PreAuthorize("hasRole('LECTURER')")
    public ResponseEntity<AssignmentResponse> createAssignment(@Valid @RequestBody AssignmentRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(assignmentService.createAssignment(request));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('LECTURER')")
    public ResponseEntity<AssignmentResponse> updateAssignment(@PathVariable Long id,
                                                               @Valid @RequestBody AssignmentRequest request) {
        return ResponseEntity.ok(assignmentService.updateAssignment(id, request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('LECTURER')")
    public ResponseEntity<Void> deleteAssignment(@PathVariable Long id) {
        assignmentService.deleteAssignment(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('LECTURER', 'STUDENT')")
    // TODO: STUDENT should only see assignments from offerings they are enrolled in
    public ResponseEntity<AssignmentResponse> getAssignmentById(@PathVariable Long id) {
        return ResponseEntity.ok(assignmentService.getAssignmentById(id));
    }

    @GetMapping("/offering/{offeringId}")
    @PreAuthorize("hasAnyRole('LECTURER', 'STUDENT')")
    // TODO: STUDENT enrollment check in service layer
    public ResponseEntity<List<AssignmentResponse>> getAssignmentsByOffering(@PathVariable Long offeringId) {
        return ResponseEntity.ok(assignmentService.getAssignmentsByOffering(offeringId));
    }
}
