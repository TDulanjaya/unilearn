package com.unilearn.server.ai;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/ai/materials")
@RequiredArgsConstructor
public class AiMaterialBackfillController {

    private final MaterialChunkService materialChunkService;

    @PostMapping("/backfill")
    @PreAuthorize("hasAnyRole('LECTURER', 'STAFF_ADMIN', 'SUPER_ADMIN', 'STUDENT')")
    public ResponseEntity<Map<String, Object>> backfillMaterials(
            @RequestParam(value = "offeringId", required = false) Long offeringId) {
        int processed = materialChunkService.backfillAllMaterials(offeringId);
        return ResponseEntity.ok(Map.of(
                "status", "success",
                "message", "Extracted and stored chunks for previously uploaded course materials and resources.",
                "processedDocuments", processed
        ));
    }
}
