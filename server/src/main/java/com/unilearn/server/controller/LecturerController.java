package com.unilearn.server.controller;

import com.unilearn.server.dto.request.LecturerRequest;
import com.unilearn.server.dto.response.CourseOfferingResponse;
import com.unilearn.server.dto.response.LecturerResponse;
import com.unilearn.server.dto.response.PageResponseDTO;
import com.unilearn.server.service.LecturerService;
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
@RequestMapping("/api/v1/lecturers")
@RequiredArgsConstructor
public class LecturerController {

    private final LecturerService lecturerService;

    @PostMapping
    @PreAuthorize("hasAnyRole('STAFF_ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<LecturerResponse> createLecturer(@Valid @RequestBody LecturerRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(lecturerService.createLecturer(request));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('STAFF_ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<LecturerResponse> updateLecturer(@PathVariable Long id,
                                                           @Valid @RequestBody LecturerRequest request) {
        return ResponseEntity.ok(lecturerService.updateLecturer(id, request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('STAFF_ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<Void> deleteLecturer(@PathVariable Long id) {
        lecturerService.deleteLecturer(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('STAFF_ADMIN', 'SUPER_ADMIN', 'HOD_DEAN', 'LECTURER')")
    public ResponseEntity<LecturerResponse> getLecturerById(@PathVariable Long id) {
        return ResponseEntity.ok(lecturerService.getLecturerById(id));
    }

    @GetMapping("/department/{departmentId}")
    @PreAuthorize("hasAnyRole('STAFF_ADMIN', 'SUPER_ADMIN', 'HOD_DEAN')")
    public ResponseEntity<PageResponseDTO<LecturerResponse>> getLecturersByDepartment(
            @PathVariable Long departmentId,
            @PageableDefault(size = 20) Pageable pageable) {
        return ResponseEntity.ok(lecturerService.getLecturersByDepartment(departmentId, pageable));
    }

    @GetMapping("/{id}/course-offerings")
    @PreAuthorize("hasAnyRole('STAFF_ADMIN', 'SUPER_ADMIN', 'HOD_DEAN', 'LECTURER')")
    public ResponseEntity<List<CourseOfferingResponse>> getCourseOfferingsForLecturer(@PathVariable Long id) {
        return ResponseEntity.ok(lecturerService.getCourseOfferingsForLecturer(id));
    }
}
