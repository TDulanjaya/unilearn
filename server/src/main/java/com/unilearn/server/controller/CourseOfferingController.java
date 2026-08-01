package com.unilearn.server.controller;

import com.unilearn.server.dto.request.CourseOfferingRequest;
import com.unilearn.server.dto.response.CourseOfferingResponse;
import com.unilearn.server.service.CourseOfferingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/course-offerings")
@RequiredArgsConstructor
public class CourseOfferingController {

    private final CourseOfferingService courseOfferingService;

    @PostMapping
    @PreAuthorize("hasAnyRole('STAFF_ADMIN', 'HOD_DEAN')")
    public ResponseEntity<CourseOfferingResponse> createCourseOffering(
            @Valid @RequestBody CourseOfferingRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(courseOfferingService.createCourseOffering(request));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('STAFF_ADMIN', 'HOD_DEAN')")
    public ResponseEntity<CourseOfferingResponse> updateCourseOffering(
            @PathVariable Long id,
            @Valid @RequestBody CourseOfferingRequest request) {
        return ResponseEntity.ok(courseOfferingService.updateCourseOffering(id, request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('STAFF_ADMIN', 'HOD_DEAN')")
    public ResponseEntity<Void> deleteCourseOffering(@PathVariable Long id) {
        courseOfferingService.deleteCourseOffering(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}")
    public ResponseEntity<CourseOfferingResponse> getCourseOfferingById(@PathVariable Long id) {
        return ResponseEntity.ok(courseOfferingService.getCourseOfferingById(id));
    }

    @GetMapping("/course/{courseId}")
    public ResponseEntity<List<CourseOfferingResponse>> getOfferingsByCourse(@PathVariable Long courseId) {
        return ResponseEntity.ok(courseOfferingService.getOfferingsByCourse(courseId));
    }

    @GetMapping("/batch/{batchId}")
    public ResponseEntity<List<CourseOfferingResponse>> getOfferingsByBatch(@PathVariable Long batchId) {
        return ResponseEntity.ok(courseOfferingService.getOfferingsByBatch(batchId));
    }

    @GetMapping("/semester/{semesterId}")
    public ResponseEntity<List<CourseOfferingResponse>> getOfferingsBySemester(@PathVariable Long semesterId) {
        return ResponseEntity.ok(courseOfferingService.getOfferingsBySemester(semesterId));
    }

    @GetMapping("/lecturer/{lecturerId}")
    public ResponseEntity<List<CourseOfferingResponse>> getOfferingsByLecturer(@PathVariable Long lecturerId) {
        return ResponseEntity.ok(courseOfferingService.getOfferingsByLecturer(lecturerId));
    }

    @GetMapping("/{id}/enrollment-count")
    public ResponseEntity<Long> getEnrollmentCount(@PathVariable Long id) {
        return ResponseEntity.ok(courseOfferingService.getEnrollmentCount(id));
    }
}
