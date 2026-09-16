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
import java.util.Set;

@RestController
@RequestMapping("/api/v1/files")
@RequiredArgsConstructor
public class FileController {

    private final StorageService storageService;
    private final Path localUploadDir = Paths.get("uploads");

    // Don't render HTML/SVG inline to avoid XSS
    private static final Set<String> DANGEROUS_INLINE_TYPES = Set.of(
            "text/html", "application/xhtml+xml", "image/svg+xml", "application/xml", "text/xml"
    );

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
            // Block path traversal
            if (!filePath.startsWith(localUploadDir)) {
                return ResponseEntity.badRequest().build();
            }
            Resource resource = new UrlResource(filePath.toUri());

            if (!resource.exists() || !resource.isReadable()) {
                return ResponseEntity.notFound().build();
            }

            String contentType = Files.probeContentType(filePath);
            if (contentType == null) {
                contentType = "application/octet-stream";
            }

            // Force download for dangerous types, inline for others
            String disposition = DANGEROUS_INLINE_TYPES.contains(contentType.toLowerCase())
                    ? "attachment"
                    : "inline";

            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(contentType))
                    .header(HttpHeaders.CONTENT_DISPOSITION, disposition + "; filename=\"" + resource.getFilename() + "\"")
                    .body(resource);
        } catch (IOException e) {
            return ResponseEntity.internalServerError().build();
        }
    }
}
