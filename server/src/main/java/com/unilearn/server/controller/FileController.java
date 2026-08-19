package com.unilearn.server.controller;

import com.unilearn.server.service.StorageService;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/files")
@RequiredArgsConstructor
public class FileController {

    private final StorageService storageService;
    private final Path localUploadDir = Paths.get("uploads");

    @PostMapping("/upload")
    public ResponseEntity<Map<String, Object>> uploadFile(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "folder", required = false, defaultValue = "events") String folder) {
        String url = storageService.uploadFile(file, folder);
        return ResponseEntity.ok(Map.of(
                "url", url,
                "fileName", file.getOriginalFilename() != null ? file.getOriginalFilename() : "file",
                "size", file.getSize(),
                "contentType", file.getContentType() != null ? file.getContentType() : "application/octet-stream"
        ));
    }

    @GetMapping("/download/{fileName:.+}")
    public ResponseEntity<Resource> downloadLocalFile(@PathVariable String fileName) {
        try {
            Path filePath = localUploadDir.resolve(fileName).normalize();
            Resource resource = new UrlResource(filePath.toUri());

            if (!resource.exists() || !resource.isReadable()) {
                return ResponseEntity.notFound().build();
            }

            String contentType = Files.probeContentType(filePath);
            if (contentType == null) {
                contentType = "application/octet-stream";
            }

            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(contentType))
                    .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + resource.getFilename() + "\"")
                    .body(resource);
        } catch (IOException e) {
            return ResponseEntity.internalServerError().build();
        }
    }
}
