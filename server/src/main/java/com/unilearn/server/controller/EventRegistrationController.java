package com.unilearn.server.controller;

import com.unilearn.server.dto.request.eventregistration.EventRegistrationCreateRequestDTO;
import com.unilearn.server.dto.response.EventRegistrationResponse;
import com.unilearn.server.model.User;
import com.unilearn.server.service.EventRegistrationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/events/{eventId}/registrations")
@RequiredArgsConstructor
public class EventRegistrationController {

    private final EventRegistrationService eventRegistrationService;

    @PostMapping
    @PreAuthorize("hasRole('STUDENT')")
    // TODO: Enforce self-only registration via authenticated principal
    public ResponseEntity<EventRegistrationResponse> registerForEvent(
            @PathVariable Long eventId,
            @Valid @RequestBody EventRegistrationCreateRequestDTO request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(eventRegistrationService.registerForEvent(request));
    }

    @DeleteMapping("/{registrationId}")
    @PreAuthorize("hasRole('STUDENT')")
    // TODO: Enforce self-only unregistration
    public ResponseEntity<Void> unregister(@PathVariable Long eventId,
                                           @PathVariable Long registrationId,
                                           @AuthenticationPrincipal User principal) {
        eventRegistrationService.cancelRegistration(eventId, principal.getUserId());
        return ResponseEntity.noContent().build();
    }

    @GetMapping
    @PreAuthorize("hasRole('STAFF_ADMIN')")
    public ResponseEntity<List<EventRegistrationResponse>> getRegistrationsByEvent(
            @PathVariable Long eventId) {
        return ResponseEntity.ok(eventRegistrationService.getRegistrationsByEvent(eventId));
    }
}
