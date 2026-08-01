package com.unilearn.server.controller;

import com.unilearn.server.dto.request.EventRequest;
import com.unilearn.server.dto.response.EventResponse;
import com.unilearn.server.dto.response.PageResponseDTO;
import com.unilearn.server.service.EventService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/events")
@RequiredArgsConstructor
public class EventController {

    private final EventService eventService;

    @PostMapping
    @PreAuthorize("hasRole('STAFF_ADMIN')")
    public ResponseEntity<EventResponse> createEvent(@Valid @RequestBody EventRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(eventService.createEvent(request));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('STAFF_ADMIN')")
    public ResponseEntity<EventResponse> updateEvent(@PathVariable Long id,
                                                     @Valid @RequestBody EventRequest request) {
        return ResponseEntity.ok(eventService.updateEvent(id, request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('STAFF_ADMIN')")
    public ResponseEntity<Void> deleteEvent(@PathVariable Long id) {
        eventService.deleteEvent(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}")
    public ResponseEntity<EventResponse> getEventById(@PathVariable Long id) {
        return ResponseEntity.ok(eventService.getEventById(id));
    }

    @GetMapping("/upcoming")
    public ResponseEntity<PageResponseDTO<EventResponse>> getUpcomingEvents(
            @PageableDefault(size = 20) Pageable pageable) {
        return ResponseEntity.ok(eventService.getUpcomingEvents(pageable));
    }

    // TODO: GET /faculty/{facultyId} — EventService does not have getEventsByFaculty() yet.
}
