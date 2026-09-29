package com.unilearn.server.controller;

import com.unilearn.server.dto.request.StaffAdminRequest;
import com.unilearn.server.dto.response.PageResponseDTO;
import com.unilearn.server.dto.response.StaffAdminResponse;
import com.unilearn.server.service.StaffAdminService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/staff-admins")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('STAFF_ADMIN', 'SUPER_ADMIN')")
public class StaffAdminController {

    private final StaffAdminService staffAdminService;

    @PostMapping
    public ResponseEntity<StaffAdminResponse> createStaffAdmin(@Valid @RequestBody StaffAdminRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(staffAdminService.createStaffAdmin(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<StaffAdminResponse> updateStaffAdmin(@PathVariable Long id,
                                                               @Valid @RequestBody StaffAdminRequest request) {
        return ResponseEntity.ok(staffAdminService.updateStaffAdmin(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteStaffAdmin(@PathVariable Long id) {
        staffAdminService.deleteStaffAdmin(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}")
    public ResponseEntity<StaffAdminResponse> getStaffAdminById(@PathVariable Long id) {
        return ResponseEntity.ok(staffAdminService.getStaffAdminById(id));
    }

    @GetMapping
    public ResponseEntity<PageResponseDTO<StaffAdminResponse>> getAllStaffAdmins(
            @PageableDefault(size = 20) Pageable pageable) {
        return ResponseEntity.ok(staffAdminService.getAllStaffAdmins(pageable));
    }
}
