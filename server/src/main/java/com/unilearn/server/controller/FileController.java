package com.unilearn.server.controller;

import com.unilearn.server.service.StorageService;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
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
    private final com.unilearn.server.repository.SubmissionRepository submissionRepository;
    private final com.unilearn.server.repository.MaterialRepository materialRepository;
    private final com.unilearn.server.repository.EnrollmentRepository enrollmentRepository;
    private final com.unilearn.server.security.OwnershipValidator ownershipValidator;
    private final Path localUploadDir = Paths.get("uploads");

    // Do not render html or svg inline
    private static final Set<String> DANGEROUS_INLINE_TYPES = Set.of(
            "text/html", "application/xhtml+xml", "image/svg+xml", "application/xml", "text/xml"
    );

    private static final long MAX_FILE_SIZE = 25 * 1024 * 1024; // 25 MB

    private static final Set<String> ALLOWED_EXTENSIONS = Set.of(
            "pdf", "png", "jpg", "jpeg", "gif", "webp",
            "doc", "docx", "xls", "xlsx", "ppt", "pptx",
            "txt", "csv", "zip", "mp4"
    );

    private static final Set<String> ALLOWED_MIME_TYPES = Set.of(
            "application/pdf", "image/jpeg", "image/png", "image/gif", "image/webp",
            "application/msword",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            "application/vnd.ms-excel",
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            "application/vnd.ms-powerpoint",
            "application/vnd.openxmlformats-officedocument.presentationml.presentation",
            "text/plain", "text/csv", "application/zip", "video/mp4", "audio/mpeg"
    );

    private void validateUploadedFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new com.unilearn.server.exception.ValidationException("Uploaded file cannot be empty");
        }

        if (file.getSize() > MAX_FILE_SIZE) {
            throw new com.unilearn.server.exception.ValidationException("File size exceeds the maximum limit of 25MB");
        }

        String originalFilename = file.getOriginalFilename();
        if (originalFilename == null || !originalFilename.contains(".")) {
            throw new com.unilearn.server.exception.ValidationException("File must have a valid extension");
        }

        String extension = originalFilename.substring(originalFilename.lastIndexOf(".") + 1).toLowerCase();
        if (!ALLOWED_EXTENSIONS.contains(extension)) {
            throw new com.unilearn.server.exception.ValidationException("File extension ." + extension + " is not allowed");
        }

        String contentType = file.getContentType();
        if (contentType != null && !ALLOWED_MIME_TYPES.contains(contentType.toLowerCase())) {
            throw new com.unilearn.server.exception.ValidationException("MIME type " + contentType + " is not permitted");
        }

        // Check file header bytes
        try (java.io.InputStream is = file.getInputStream()) {
            byte[] header = new byte[16];
            int read = is.read(header, 0, header.length);
            if (read >= 2) {
                // Reject Windows exe
                if (header[0] == 0x4D && header[1] == 0x5A) {
                    throw new com.unilearn.server.exception.ValidationException("Executable binary files (.exe / .dll) are forbidden");
                }
                // Reject Linux binary
                if (read >= 4 && header[0] == 0x7F && header[1] == 0x45 && header[2] == 0x4C && header[3] == 0x46) {
                    throw new com.unilearn.server.exception.ValidationException("Executable binary files (ELF) are forbidden");
                }
                // Reject shell script
                if (header[0] == 0x23 && header[1] == 0x21) {
                    throw new com.unilearn.server.exception.ValidationException("Shell script files are forbidden");
                }
            }
        } catch (IOException e) {
            throw new com.unilearn.server.exception.ValidationException("Unable to read and verify uploaded file contents");
        }
    }

    @PostMapping("/upload")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Map<String, Object>> uploadFile(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "folder", required = false, defaultValue = "events") String folder) {
        validateUploadedFile(file);
        String url = storageService.uploadFile(file, folder);
        return ResponseEntity.ok(Map.of(
                "url", url,
                "fileName", file.getOriginalFilename() != null ? file.getOriginalFilename() : "file",
                "size", file.getSize(),
                "contentType", file.getContentType() != null ? file.getContentType() : "application/octet-stream"
        ));
    }

    @GetMapping("/download/{fileName:.+}")
    @org.springframework.security.access.prepost.PreAuthorize("permitAll()")
    public ResponseEntity<Resource> downloadLocalFile(
            @PathVariable String fileName,
            @org.springframework.security.core.annotation.AuthenticationPrincipal com.unilearn.server.model.User principal) {
        try {
            Path filePath = localUploadDir.resolve(fileName).normalize();
            // Block path traversal
            if (!filePath.startsWith(localUploadDir)) {
                return ResponseEntity.badRequest().build();
            }
            // Check file access permission
            if (fileName.startsWith("submissions_")) {
                if (principal == null) {
                    throw new org.springframework.security.access.AccessDeniedException("Authentication required to download submission files");
                }
                if ("student".equalsIgnoreCase(principal.getRole())) {
                    var submissionOpt = submissionRepository.findFirstByFileUrlContaining(fileName);
                    if (submissionOpt.isPresent()) {
                        Long ownerStudentId = submissionOpt.get().getStudent().getStudentId();
                        if (!ownerStudentId.equals(principal.getUserId())) {
                            throw new org.springframework.security.access.AccessDeniedException("Access denied: You cannot download another student's submission");
                        }
                    }
                }
            } else if (fileName.startsWith("materials_")) {
                if (principal == null) {
                    throw new org.springframework.security.access.AccessDeniedException("Authentication required to download course materials");
                }
                var materialOpt = materialRepository.findFirstByFileUrlContaining(fileName);
                if (materialOpt.isPresent() && materialOpt.get().getCourseOffering() != null) {
                    Long offeringId = materialOpt.get().getCourseOffering().getOfferingId();
                    if ("student".equalsIgnoreCase(principal.getRole())) {
                        boolean enrolled = enrollmentRepository.existsByStudent_StudentIdAndCourseOffering_OfferingId(principal.getUserId(), offeringId);
                        if (!enrolled) {
                            throw new org.springframework.security.access.AccessDeniedException("Access denied: You are not enrolled in this course offering");
                        }
                    } else if (ownershipValidator.isLecturer()) {
                        ownershipValidator.checkLecturerOfferingAccess(offeringId);
                    }
                }
            }

            Resource resource = new UrlResource(filePath.toUri());

            if (!resource.exists() || !resource.isReadable()) {
                return ResponseEntity.notFound().build();
            }

            String contentType = Files.probeContentType(filePath);
            if (contentType == null) {
                contentType = "application/octet-stream";
            }

            // Force download for risky files, inline for others
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
