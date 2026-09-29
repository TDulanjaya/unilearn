package com.unilearn.server.service;

import org.springframework.web.multipart.MultipartFile;

public interface StorageService {
    // Upload a file to storage
    String uploadFile(MultipartFile file, String folder);

    // Delete a file by url or key
    void deleteFile(String fileUrl);
}
