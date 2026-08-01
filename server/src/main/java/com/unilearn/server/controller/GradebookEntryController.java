package com.unilearn.server.controller;

import com.unilearn.server.dto.request.GradebookEntryRequest;
import com.unilearn.server.dto.response.GradebookEntryResponse;
import com.unilearn.server.service.GradebookEntryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/gradebook")
@RequiredArgsConstructor
public class GradebookEntryController {

    private final GradebookEntryService gradebookEntryService;

    @PostMapping
    @PreAuthorize("hasRole('LECTURER')")
    public ResponseEntity<GradebookEntryResponse> recordEntry(
            @Valid @RequestBody GradebookEntryRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(gradebookEntryService.createGradebookEntry(request));
    }

    @GetMapping("/student/{studentId}/offering/{offeringId}")
    @PreAuthorize("hasAnyRole('LECTURER', 'STUDENT')")
    // TODO: If STUDENT, enforce that studentId matches the authenticated student.
    //       GradebookEntryService only has getEntriesByStudent(studentId), not filtered by offering.
    //       Filtering by offering may need to be done here or added to the service.
    public ResponseEntity<List<GradebookEntryResponse>> getEntriesByStudentAndOffering(
            @PathVariable Long studentId,
            @PathVariable Long offeringId) {
        // Note: Service currently only supports getEntriesByStudent(studentId).
        // The offeringId filtering should be implemented in the service layer.
        return ResponseEntity.ok(gradebookEntryService.getEntriesByStudent(studentId));
    }

    // TODO: GET /student/{studentId}/offering/{offeringId}/final-grade
    //       computeFinalGrade is not in the current GradebookEntryService interface.
}
