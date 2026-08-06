package com.unilearn.server.controller;

import com.unilearn.server.dto.request.TimetableSlotRequest;
import com.unilearn.server.dto.response.TimetableSlotResponse;
import com.unilearn.server.service.TimetableSlotService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/timetable-slots")
@RequiredArgsConstructor
public class TimetableSlotController {

    private final TimetableSlotService timetableSlotService;

    @PostMapping
    @PreAuthorize("hasAnyRole('STAFF_ADMIN', 'HOD_DEAN')")
    public ResponseEntity<TimetableSlotResponse> createSlot(@Valid @RequestBody TimetableSlotRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(timetableSlotService.createSlot(request));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('STAFF_ADMIN', 'HOD_DEAN')")
    public ResponseEntity<TimetableSlotResponse> updateSlot(@PathVariable Long id,
                                                            @Valid @RequestBody TimetableSlotRequest request) {
        return ResponseEntity.ok(timetableSlotService.updateSlot(id, request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('STAFF_ADMIN', 'HOD_DEAN')")
    public ResponseEntity<Void> deleteSlot(@PathVariable Long id) {
        timetableSlotService.deleteSlot(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/offering/{offeringId}")
    public ResponseEntity<List<TimetableSlotResponse>> getSlotsByOffering(@PathVariable Long offeringId) {
        return ResponseEntity.ok(timetableSlotService.getSlotsByOffering(offeringId));
    }

    @GetMapping
    public ResponseEntity<List<TimetableSlotResponse>> getAllSlots() {
        return ResponseEntity.ok(timetableSlotService.getAllSlots());
    }
}
