package com.unilearn.server.service.impl;

import com.unilearn.server.exception.ValidationException;
import com.unilearn.server.service.StorageService;
import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.S3Configuration;
import software.amazon.awssdk.services.s3.model.DeleteObjectRequest;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.net.URI;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;

@Service
@Slf4j
public class BackblazeStorageServiceImpl implements StorageService {

    @Value("${storage.b2.key-id:}")
    private String keyId;

    @Value("${storage.b2.application-key:}")
    private String applicationKey;

    @Value("${storage.b2.endpoint:https://s3.us-west-004.backblazeb2.com}")
    private String endpoint;

    @Value("${storage.b2.bucket-name:unilearn-files}")
    private String bucketName;

    @Value("${storage.b2.region:us-west-004}")
    private String region;

    private S3Client s3Client;
    private final Path localUploadDir = Paths.get("uploads");

    @PostConstruct
    public void init() {
        if (keyId != null && !keyId.isBlank() && applicationKey != null && !applicationKey.isBlank()) {
            try {
                AwsBasicCredentials credentials = AwsBasicCredentials.create(keyId.trim(), applicationKey.trim());
                this.s3Client = S3Client.builder()
                        .endpointOverride(URI.create(endpoint.trim()))
                        .region(Region.of(region.trim()))
                        .credentialsProvider(StaticCredentialsProvider.create(credentials))
                        .serviceConfiguration(S3Configuration.builder()
                                .pathStyleAccessEnabled(true)
                                .build())
                        .build();
                log.info("Initialized Backblaze B2 S3Client for bucket: {}", bucketName);
            } catch (Exception e) {
                log.warn("Could not initialize Backblaze B2 S3Client. Falling back to local storage: {}", e.getMessage());
            }
        } else {
            log.info("Backblaze B2 credentials not configured. Using local filesystem storage in './uploads'.");
        }

        try {
            if (!Files.exists(localUploadDir)) {
                Files.createDirectories(localUploadDir);
            }
        } catch (IOException e) {
            log.error("Failed to create local uploads directory", e);
        }
    }

    @Override
    public String uploadFile(MultipartFile file, String folder) {
        if (file == null || file.isEmpty()) {
            throw new ValidationException("Uploaded file cannot be empty");
        }

        String originalFilename = file.getOriginalFilename();
        String extension = "";
        if (originalFilename != null && originalFilename.contains(".")) {
            extension = originalFilename.substring(originalFilename.lastIndexOf("."));
        }

        String safePrefix = (folder != null && !folder.isBlank()) ? folder.trim().replaceAll("[^a-zA-Z0-9_-]", "") + "/" : "";
        String uniqueFileName = safePrefix + UUID.randomUUID() + extension;

        // 1. Store locally first to guarantee direct and immediate browser loading
        String localFileName = uniqueFileName.replace("/", "_");
        try {
            Path targetPath = localUploadDir.resolve(localFileName);
            Files.write(targetPath, file.getBytes());
            log.info("Saved file locally at uploads/{}", localFileName);
        } catch (IOException e) {
            log.error("Failed to write file locally", e);
        }

        // 2. Also back up to cloud S3 storage (Backblaze / Storj) if configured
        if (s3Client != null) {
            try {
                PutObjectRequest putObjectRequest = PutObjectRequest.builder()
                        .bucket(bucketName)
                        .key(uniqueFileName)
                        .contentType(file.getContentType())
                        .build();

                s3Client.putObject(putObjectRequest, RequestBody.fromInputStream(file.getInputStream(), file.getSize()));
                log.info("Successfully backed up file to cloud S3 bucket: {}", uniqueFileName);
            } catch (Exception e) {
                log.warn("Cloud S3 backup skipped: {}", e.getMessage());
            }
        }

        String localUrl = "/api/v1/files/download/" + localFileName;
        return localUrl;
    }

    @Override
    public void deleteFile(String fileUrl) {
        if (fileUrl == null || fileUrl.isBlank()) return;

        if (s3Client != null && fileUrl.contains(bucketName)) {
            try {
                String key = fileUrl.substring(fileUrl.indexOf(bucketName) + bucketName.length() + 1);
                s3Client.deleteObject(DeleteObjectRequest.builder().bucket(bucketName).key(key).build());
                log.info("Deleted file from Backblaze B2: {}", key);
                return;
            } catch (Exception e) {
                log.warn("Failed to delete file from Backblaze B2: {}", e.getMessage());
            }
        }

        try {
            String fileName = fileUrl.substring(fileUrl.lastIndexOf("/") + 1);
            Path filePath = localUploadDir.resolve(fileName);
            Files.deleteIfExists(filePath);
        } catch (IOException e) {
            log.warn("Failed to delete local file: {}", e.getMessage());
        }
    }
}
