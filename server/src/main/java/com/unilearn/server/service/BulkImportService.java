package com.unilearn.server.service;

import com.unilearn.server.dto.response.BulkImportResponse;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

/**
 * Service interface for bulk importing users/students/lecturers.
 */
public interface BulkImportService {

    List<BulkImportResponse> importUsers(MultipartFile file, String role);
}
