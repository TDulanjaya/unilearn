package com.unilearn.server.controller;

import com.unilearn.server.dto.request.CourseOfferingLecturerRequest;
import com.unilearn.server.dto.response.CourseOfferingLecturerResponse;
import com.unilearn.server.dto.response.CourseOfferingResponse;
import com.unilearn.server.dto.response.LecturerResponse;
import com.unilearn.server.service.CourseOfferingLecturerService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/course-offerings/{offeringId}/lecturers")
@RequiredArgsConstructor
public class CourseOfferingLecturerController {

    private final CourseOfferingLecturerService courseOfferingLecturerService;

    @PostMapping("/{lecturerId}")
    @PreAuthorize("hasAnyRole('STAFF_ADMIN', 'HOD_DEAN')")
    public ResponseEntity<CourseOfferingLecturerResponse> assignLecturer(
            @PathVariable Long offeringId,
            @PathVariable Long lecturerId) {
        CourseOfferingLecturerRequest request = new CourseOfferingLecturerRequest();
        request.setOfferingId(offeringId);
        request.setLecturerId(lecturerId);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(courseOfferingLecturerService.assignLecturer(request));
    }

    @DeleteMapping("/{lecturerId}")
    @PreAuthorize("hasAnyRole('STAFF_ADMIN', 'HOD_DEAN')")
    public ResponseEntity<Void> removeLecturer(@PathVariable Long offeringId,
                                               @PathVariable Long lecturerId) {
        courseOfferingLecturerService.removeLecturer(offeringId, lecturerId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping
    public ResponseEntity<List<LecturerResponse>> getLecturersForOffering(@PathVariable Long offeringId) {
        return ResponseEntity.ok(courseOfferingLecturerService.getLecturersForOffering(offeringId));
    }

    @GetMapping("/api/v1/lecturers/{lecturerId}/course-offerings")
    public ResponseEntity<List<CourseOfferingResponse>> getOfferingsForLecturer(
            @PathVariable Long lecturerId) {
        return ResponseEntity.ok(courseOfferingLecturerService.getOfferingsForLecturer(lecturerId));
    }
}
