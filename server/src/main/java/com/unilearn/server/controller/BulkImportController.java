package com.unilearn.server.controller;

import com.unilearn.server.dto.response.BulkImportResponse;
import com.unilearn.server.service.BulkImportService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/v1/bulk-import")
@RequiredArgsConstructor
@PreAuthorize("hasRole('STAFF_ADMIN')")
public class BulkImportController {

    private final BulkImportService bulkImportService;

    @PostMapping("/students")
    public ResponseEntity<List<BulkImportResponse>> importStudents(
            @RequestParam("file") MultipartFile csvFile) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(bulkImportService.importUsers(csvFile, "STUDENT"));
    }
}
