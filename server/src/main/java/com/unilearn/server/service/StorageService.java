package com.unilearn.server.service;

import org.springframework.web.multipart.MultipartFile;

public interface StorageService {
    /**
     * Upload a file to Backblaze B2 (or fallback storage if credentials not configured)
     *
     * @param file the multipart file
     * @param folder the target folder prefix (e.g. "events", "avatars", "materials")
     * @return the accessible public URL of the uploaded file
     */
    String uploadFile(MultipartFile file, String folder);

    /**
     * Delete a file by its URL or key
     *
     * @param fileUrl public URL or key
     */
    void deleteFile(String fileUrl);
}
