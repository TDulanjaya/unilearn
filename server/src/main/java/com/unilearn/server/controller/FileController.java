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
    private final com.unilearn.server.repository.PersonalResourceRepository personalResourceRepository;
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

    // who can open a submission file: the student who sent it, lecturers of the offering,
    // the HOD of the course's department, and staff admins
    private void checkSubmissionFileAccess(String fileName, com.unilearn.server.model.User principal) {
        if (ownershipValidator.isStaffOrSuperAdmin()) {
            return;
        }
        var submission = submissionRepository.findAllByFileUrlLike(fileName).stream()
                .filter(sub -> sub.getFileUrl() != null && sub.getFileUrl().contains(fileName))
                .findFirst()
                .orElseThrow(() -> new org.springframework.security.access.AccessDeniedException("Access denied: Submission not found for this file"));

        if (ownershipValidator.isStudent()) {
            Long ownerStudentId = submission.getStudent() != null ? submission.getStudent().getStudentId() : null;
            if (!principal.getUserId().equals(ownerStudentId)) {
                throw new org.springframework.security.access.AccessDeniedException("Access denied: You cannot download another student's submission");
            }
            return;
        }

        var offering = submission.getAssignment() != null ? submission.getAssignment().getCourseOffering() : null;
        if (offering == null) {
            throw new org.springframework.security.access.AccessDeniedException("Access denied: Course offering not found for this submission");
        }
        if (ownershipValidator.isLecturer()) {
            ownershipValidator.checkLecturerOfferingAccess(offering.getOfferingId());
            return;
        }
        if (ownershipValidator.isHodDean()) {
            Long departmentId = offering.getCourse() != null && offering.getCourse().getDepartment() != null
                    ? offering.getCourse().getDepartment().getDepartmentId()
                    : null;
            if (departmentId == null) {
                throw new org.springframework.security.access.AccessDeniedException("Access denied: Department not found for this submission");
            }
            ownershipValidator.checkHodDepartmentAccess(departmentId);
            return;
        }
        throw new org.springframework.security.access.AccessDeniedException("Access denied: You cannot download this submission");
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
                checkSubmissionFileAccess(fileName, principal);
            } else if (fileName.startsWith("resources_")) {
                if (principal == null) {
                    throw new org.springframework.security.access.AccessDeniedException("Authentication required to download this file");
                }
                // personal resources are private to the student who uploaded them
                if (!ownershipValidator.isStaffOrSuperAdmin()) {
                    var personalRes = personalResourceRepository.findAllByFileUrlLike(fileName).stream()
                            .filter(r -> r.getFileUrl() != null && r.getFileUrl().contains(fileName))
                            .findFirst();
                    boolean owner = personalRes.isPresent()
                            && personalRes.get().getStudent() != null
                            && principal.getUserId().equals(personalRes.get().getStudent().getStudentId());
                    if (!owner) {
                        throw new org.springframework.security.access.AccessDeniedException("Access denied: This file belongs to another student");
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
