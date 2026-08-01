package com.unilearn.server.controller;

import com.unilearn.server.dto.request.MaterialRequest;
import com.unilearn.server.dto.response.MaterialResponse;
import com.unilearn.server.dto.response.PageResponseDTO;
import com.unilearn.server.service.MaterialService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/materials")
@RequiredArgsConstructor
public class MaterialController {

    private final MaterialService materialService;

    @PostMapping
    @PreAuthorize("hasRole('LECTURER')")
    public ResponseEntity<MaterialResponse> uploadMaterial(@Valid @RequestBody MaterialRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(materialService.createMaterial(request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('LECTURER')")
    public ResponseEntity<Void> deleteMaterial(@PathVariable Long id) {
        materialService.deleteMaterial(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/offering/{offeringId}")
    @PreAuthorize("hasAnyRole('LECTURER', 'STUDENT')")
    // TODO: STUDENT enrollment check in service layer
    public ResponseEntity<PageResponseDTO<MaterialResponse>> getMaterialsByOffering(
            @PathVariable Long offeringId,
            @PageableDefault(size = 20) Pageable pageable) {
        return ResponseEntity.ok(materialService.getMaterialsByOffering(offeringId, pageable));
    }
}
