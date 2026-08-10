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

import com.unilearn.server.model.User;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
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
    public ResponseEntity<List<GradebookEntryResponse>> getEntriesByStudentAndOffering(
            @AuthenticationPrincipal User principal,
            @PathVariable Long studentId,
            @PathVariable Long offeringId) {
        if ("student".equalsIgnoreCase(principal.getRole()) && !studentId.equals(principal.getUserId())) {
            throw new AccessDeniedException("Access denied: Students can only access their own gradebook entries");
        }
        return ResponseEntity.ok(gradebookEntryService.getEntriesByStudent(studentId));
    }
}
