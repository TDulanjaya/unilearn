package com.unilearn.server.controller;

import com.unilearn.server.dto.request.ProctoringFlagRequest;
import com.unilearn.server.dto.response.ProctoringFlagResponse;
import com.unilearn.server.service.ProctoringFlagService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/proctoring-flags")
@RequiredArgsConstructor
@PreAuthorize("hasRole('LECTURER')")
public class ProctoringFlagController {

    private final ProctoringFlagService proctoringFlagService;

    @PostMapping
    public ResponseEntity<ProctoringFlagResponse> flagAttempt(
            @Valid @RequestBody ProctoringFlagRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(proctoringFlagService.flagAttempt(request));
    }

    @GetMapping("/attempt/{attemptId}")
    public ResponseEntity<List<ProctoringFlagResponse>> getFlagsByAttempt(@PathVariable Long attemptId) {
        return ResponseEntity.ok(proctoringFlagService.getFlagsByAttempt(attemptId));
    }
}
