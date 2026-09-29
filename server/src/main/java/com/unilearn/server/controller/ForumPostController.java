package com.unilearn.server.controller;

import com.unilearn.server.dto.request.ForumPostRequest;
import com.unilearn.server.dto.response.ForumPostResponse;
import com.unilearn.server.dto.response.PageResponseDTO;
import com.unilearn.server.service.ForumPostService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/forum-posts")
@RequiredArgsConstructor
public class ForumPostController {

    private final ForumPostService forumPostService;

    @PostMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ForumPostResponse> createPost(@Valid @RequestBody ForumPostRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(forumPostService.createPost(request));
    }

    @GetMapping("/offering/{offeringId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<PageResponseDTO<ForumPostResponse>> getPostsByOffering(
            @PathVariable Long offeringId,
            @PageableDefault(size = 20) Pageable pageable) {
        return ResponseEntity.ok(forumPostService.getPostsByOffering(offeringId, pageable));
    }

    @PatchMapping("/{id}/hide")
    @PreAuthorize("hasAnyRole('LECTURER', 'HOD_DEAN', 'STAFF_ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<ForumPostResponse> hidePost(@PathVariable Long id,
                                                      @Valid @RequestBody ForumPostRequest request) {
        return ResponseEntity.ok(forumPostService.updatePost(id, request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('LECTURER', 'HOD_DEAN', 'STAFF_ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<Void> deletePost(@PathVariable Long id) {
        forumPostService.deletePost(id);
        return ResponseEntity.noContent().build();
    }
}
