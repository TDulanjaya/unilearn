package com.unilearn.server.ai;

import lombok.extern.slf4j.Slf4j;
import org.apache.tika.Tika;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.InputStream;
import java.net.URI;
import java.net.URL;
import java.net.URLConnection;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

@Service
@Slf4j
public class DocumentTextExtractorService {

    private final Tika tika;
    private final Path localUploadDir = Paths.get("uploads");
    private final Path serverUploadDir = Paths.get("server", "uploads");

    public DocumentTextExtractorService() {
        this.tika = new Tika();
        // no length limit
        this.tika.setMaxStringLength(-1);
    }

    // extract text from uploaded file
    public String extractText(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            return "";
        }
        try (InputStream is = file.getInputStream()) {
            String parsed = tika.parseToString(is);
            return cleanExtractedText(parsed);
        } catch (Exception e) {
            log.warn("Failed to extract text from multipart file {}: {}", file.getOriginalFilename(), e.getMessage());
            return "";
        }
    }

    private static final java.util.Set<String> IMAGE_EXTENSIONS = java.util.Set.of(
            "jpg", "jpeg", "png", "bmp", "gif", "webp", "tiff", "tif"
    );

    // extract text from file path or remote url
    public String extractTextFromUrl(String fileUrl) {
        if (fileUrl == null || fileUrl.isBlank()) {
            return "";
        }

        String extension = getFileExtension(fileUrl);
        boolean isImage = IMAGE_EXTENSIONS.contains(extension);

        // check local files first
        Path localPath = resolveLocalFilePath(fileUrl);
        if (localPath != null && Files.exists(localPath)) {
            if (isImage) {
                return extractImageOrScannedOcr(localPath);
            }

            try (InputStream is = Files.newInputStream(localPath)) {
                log.info("Extracting text with Tika from local file: {}", localPath.toAbsolutePath());
                String parsed = tika.parseToString(is);
                String cleaned = cleanExtractedText(parsed);
                if (!cleaned.isBlank()) {
                    return cleaned;
                }
                // scanned pdf fallback
                if ("pdf".equalsIgnoreCase(extension)) {
                    return extractImageOrScannedOcr(localPath);
                }
            } catch (Exception e) {
                log.warn("Failed to parse local file {} with Tika: {}", localPath, e.getMessage());
                if ("pdf".equalsIgnoreCase(extension)) {
                    return extractImageOrScannedOcr(localPath);
                }
            }
        }

        // fall back to remote url stream
        if (fileUrl.startsWith("http://") || fileUrl.startsWith("https://")) {
            if (isImage) {
                return "text not available";
            }
            try {
                URL url = URI.create(fileUrl).toURL();
                URLConnection conn = url.openConnection();
                conn.setConnectTimeout(8000);
                conn.setReadTimeout(20000);
                try (InputStream is = conn.getInputStream()) {
                    log.info("Extracting text with Tika from remote URL: {}", fileUrl);
                    String parsed = tika.parseToString(is);
                    String cleaned = cleanExtractedText(parsed);
                    if (!cleaned.isBlank()) {
                        return cleaned;
                    }
                    if ("pdf".equalsIgnoreCase(extension)) {
                        return "text not available";
                    }
                }
            } catch (Exception e) {
                log.warn("Failed to extract text from remote URL {}: {}", fileUrl, e.getMessage());
                if ("pdf".equalsIgnoreCase(extension)) {
                    return "text not available";
                }
            }
        }

        return isImage ? "text not available" : "";
    }

    // try ocr with tesseract or tess4j; otherwise mark text not available
    public String extractImageOrScannedOcr(Path filePath) {
        if (filePath == null || !Files.exists(filePath)) {
            return "text not available";
        }

        // check tesseract cli
        try {
            Process process = new ProcessBuilder("tesseract", filePath.toAbsolutePath().toString(), "stdout")
                    .redirectErrorStream(true)
                    .start();
            boolean finished = process.waitFor(15, java.util.concurrent.TimeUnit.SECONDS);
            if (finished && process.exitValue() == 0) {
                try (InputStream is = process.getInputStream()) {
                    String ocrOut = new String(is.readAllBytes(), java.nio.charset.StandardCharsets.UTF_8).trim();
                    if (!ocrOut.isBlank()) {
                        return cleanExtractedText(ocrOut);
                    }
                }
            }
        } catch (Throwable ignored) {
            // cli unavailable
        }

        // check tess4j via reflection if loaded
        try {
            Class<?> tessClass = Class.forName("net.sourceforge.tess4j.Tesseract");
            Object instance = tessClass.getDeclaredConstructor().newInstance();
            java.lang.reflect.Method doOcrMethod = tessClass.getMethod("doOCR", java.io.File.class);
            Object result = doOcrMethod.invoke(instance, filePath.toFile());
            if (result instanceof String s && !s.isBlank()) {
                return cleanExtractedText(s);
            }
        } catch (Throwable ignored) {
            // tess4j unavailable
        }

        return "text not available";
    }

    private String getFileExtension(String path) {
        if (path == null) return "";
        int dot = path.lastIndexOf('.');
        if (dot == -1) return "";
        int q = path.indexOf('?', dot);
        return (q != -1 ? path.substring(dot + 1, q) : path.substring(dot + 1)).toLowerCase();
    }

    // resolve path from relative upload url
    private Path resolveLocalFilePath(String fileUrl) {
        String cleanUrl = fileUrl.trim();
        String fileName = cleanUrl;

        if (cleanUrl.contains("/api/v1/files/download/")) {
            fileName = cleanUrl.substring(cleanUrl.indexOf("/api/v1/files/download/") + "/api/v1/files/download/".length());
        } else if (cleanUrl.startsWith("/uploads/")) {
            fileName = cleanUrl.substring("/uploads/".length());
        } else if (cleanUrl.startsWith("uploads/")) {
            fileName = cleanUrl.substring("uploads/".length());
        } else if (cleanUrl.contains("/")) {
            fileName = cleanUrl.substring(cleanUrl.lastIndexOf("/") + 1);
        }

        // local uploads dir
        Path p1 = localUploadDir.resolve(fileName).normalize();
        if (Files.exists(p1)) return p1;

        // root relative uploads dir
        Path p2 = serverUploadDir.resolve(fileName).normalize();
        if (Files.exists(p2)) return p2;

        // sibling uploads dir
        Path p3 = Paths.get("..", "server", "uploads").resolve(fileName).normalize();
        if (Files.exists(p3)) return p3;

        // direct path check
        Path p4 = Paths.get(cleanUrl).normalize();
        if (Files.exists(p4)) return p4;

        return p1;
    }

    private String cleanExtractedText(String text) {
        if (text == null) return "";
        // normalize line breaks and strip control chars
        return text.replace("\r\n", "\n")
                .replaceAll("[\\x00-\\x08\\x0B\\x0C\\x0E-\\x1F]", "")
                .replaceAll("(?m)^[ \\t]+$", "")
                .replaceAll("\\n{3,}", "\n\n")
                .trim();
    }
}
