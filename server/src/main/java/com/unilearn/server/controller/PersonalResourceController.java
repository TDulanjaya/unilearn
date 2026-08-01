package com.unilearn.server.controller;

import com.unilearn.server.dto.request.PersonalResourceRequest;
import com.unilearn.server.dto.response.PageResponseDTO;
import com.unilearn.server.dto.response.PersonalResourceResponse;
import com.unilearn.server.model.User;
import com.unilearn.server.service.PersonalResourceService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

/**
 * Personal resource controller — STUDENT only, always acting on the caller's own records.
 * Never accepts studentId as a path/query param (privacy protection per FR-RES-03).
 */
@RestController
@RequestMapping("/api/v1/personal-resources")
@RequiredArgsConstructor
@PreAuthorize("hasRole('STUDENT')")
public class PersonalResourceController {

    private final PersonalResourceService personalResourceService;

    @PostMapping
    public ResponseEntity<PersonalResourceResponse> uploadResource(
            @Valid @RequestBody PersonalResourceRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(personalResourceService.createPersonalResource(request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteResource(@PathVariable Long id) {
        personalResourceService.deletePersonalResource(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/offering/{offeringId}")
    public ResponseEntity<PageResponseDTO<PersonalResourceResponse>> getResourcesByStudentAndOffering(
            @AuthenticationPrincipal User principal,
            @PathVariable Long offeringId,
            @PageableDefault(size = 20) Pageable pageable) {
        // Derives studentId from authenticated principal — never from client-supplied param
        return ResponseEntity.ok(personalResourceService.getResourcesByUser(principal.getUserId(), pageable));
    }
}
