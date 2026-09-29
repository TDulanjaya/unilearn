package com.unilearn.server.controller;

import com.unilearn.server.dto.request.hoddeanassignment.HodDeanAssignRequestDTO;
import com.unilearn.server.dto.request.hoddeanassignment.HodDeanRevokeRequestDTO;
import com.unilearn.server.dto.response.HodDeanAssignmentResponse;
import com.unilearn.server.service.HodDeanAssignmentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/hod-dean-assignments")
@RequiredArgsConstructor
public class HodDeanAssignmentController {

    private final HodDeanAssignmentService hodDeanAssignmentService;

    @PostMapping
    @PreAuthorize("hasAnyRole('STAFF_ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<HodDeanAssignmentResponse> assignHodOrDean(
            @Valid @RequestBody HodDeanAssignRequestDTO request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(hodDeanAssignmentService.assignHodOrDean(request));
    }

    @PatchMapping("/{id}/revoke")
    @PreAuthorize("hasAnyRole('STAFF_ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<HodDeanAssignmentResponse> revokeAssignment(
            @PathVariable Long id,
            @Valid @RequestBody HodDeanRevokeRequestDTO revokeRequest) {
        return ResponseEntity.ok(hodDeanAssignmentService.revokeAssignment(id, revokeRequest));
    }

    @GetMapping("/user/{userId}")
    @PreAuthorize("hasAnyRole('STAFF_ADMIN', 'SUPER_ADMIN', 'HOD_DEAN')")
    public ResponseEntity<List<HodDeanAssignmentResponse>> getAssignmentsByUser(@PathVariable Long userId) {
        return ResponseEntity.ok(hodDeanAssignmentService.getAssignmentsByUser(userId));
    }

    @GetMapping("/department/{departmentId}/active")
    @PreAuthorize("hasAnyRole('STAFF_ADMIN', 'SUPER_ADMIN', 'HOD_DEAN')")
    public ResponseEntity<HodDeanAssignmentResponse> getActiveHodForDepartment(
            @PathVariable Long departmentId) {
        return ResponseEntity.ok(hodDeanAssignmentService.getActiveHodForDepartment(departmentId));
    }

    @GetMapping("/faculty/{facultyId}/active")
    @PreAuthorize("hasAnyRole('STAFF_ADMIN', 'SUPER_ADMIN', 'HOD_DEAN')")
    public ResponseEntity<HodDeanAssignmentResponse> getActiveDeanForFaculty(@PathVariable Long facultyId) {
        return ResponseEntity.ok(hodDeanAssignmentService.getActiveDeanForFaculty(facultyId));
    }
}
