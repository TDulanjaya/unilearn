package com.unilearn.server.controller;

import com.unilearn.server.dto.request.CourseRequest;
import com.unilearn.server.dto.response.CourseResponse;
import com.unilearn.server.dto.response.PageResponseDTO;
import com.unilearn.server.service.CourseService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/courses")
@RequiredArgsConstructor
public class CourseController {

    private final CourseService courseService;

    @PostMapping
    @PreAuthorize("hasAnyRole('STAFF_ADMIN', 'SUPER_ADMIN', 'HOD_DEAN')")
    public ResponseEntity<CourseResponse> createCourse(@Valid @RequestBody CourseRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(courseService.createCourse(request));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('STAFF_ADMIN', 'SUPER_ADMIN', 'HOD_DEAN')")
    public ResponseEntity<CourseResponse> updateCourse(@PathVariable Long id,
                                                        @Valid @RequestBody CourseRequest request) {
        return ResponseEntity.ok(courseService.updateCourse(id, request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('STAFF_ADMIN', 'SUPER_ADMIN', 'HOD_DEAN')")
    public ResponseEntity<Void> deleteCourse(@PathVariable Long id) {
        courseService.deleteCourse(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<CourseResponse> getCourseById(@PathVariable Long id) {
        return ResponseEntity.ok(courseService.getCourseById(id));
    }

    @GetMapping("/department/{departmentId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<PageResponseDTO<CourseResponse>> getCoursesByDepartment(
            @PathVariable Long departmentId,
            @PageableDefault(size = 20) Pageable pageable) {
        return ResponseEntity.ok(courseService.getCoursesByDepartment(departmentId, pageable));
    }

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<PageResponseDTO<CourseResponse>> getAllCourses(
            @PageableDefault(size = 20) Pageable pageable) {
        return ResponseEntity.ok(courseService.getAllCourses(pageable));
    }
}
