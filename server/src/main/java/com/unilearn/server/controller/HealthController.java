package com.unilearn.server.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;
import java.util.Map;

@RestController
public class HealthController {

    @GetMapping({"/", "/health", "/api/health", "/api/v1/health"})
    @org.springframework.security.access.prepost.PreAuthorize("permitAll()")
    public ResponseEntity<Map<String, Object>> healthCheck() {
        return ResponseEntity.ok(Map.of(
                "status", "UP",
                "service", "UniLearn Backend",
                "timestamp", Instant.now().toString()
        ));
    }
}
