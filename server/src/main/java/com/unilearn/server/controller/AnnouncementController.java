package com.unilearn.server.controller;

import com.unilearn.server.dto.request.AnnouncementRequest;
import com.unilearn.server.dto.response.AnnouncementResponse;
import com.unilearn.server.dto.response.PageResponseDTO;
import com.unilearn.server.service.AnnouncementService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/announcements")
@RequiredArgsConstructor
public class AnnouncementController {

    private final AnnouncementService announcementService;

    @PostMapping
    @PreAuthorize("hasAnyRole('LECTURER', 'HOD_DEAN', 'STAFF_ADMIN')")
    public ResponseEntity<AnnouncementResponse> createAnnouncement(
            @Valid @RequestBody AnnouncementRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(announcementService.createAnnouncement(request));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('LECTURER', 'HOD_DEAN', 'STAFF_ADMIN')")
    public ResponseEntity<AnnouncementResponse> updateAnnouncement(
            @PathVariable Long id,
            @Valid @RequestBody AnnouncementRequest request) {
        return ResponseEntity.ok(announcementService.updateAnnouncement(id, request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('LECTURER', 'HOD_DEAN', 'STAFF_ADMIN')")
    public ResponseEntity<Void> deleteAnnouncement(@PathVariable Long id) {
        announcementService.deleteAnnouncement(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/me")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<PageResponseDTO<AnnouncementResponse>> getAnnouncementsVisibleToUser(
            @RequestParam String scope,
            @RequestParam Long scopeId,
            @PageableDefault(size = 20) Pageable pageable) {
        return ResponseEntity.ok(announcementService.getAnnouncementsByScope(scope, scopeId, pageable));
    }
}
