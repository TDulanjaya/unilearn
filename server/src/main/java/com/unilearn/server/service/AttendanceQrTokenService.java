package com.unilearn.server.service;

import com.unilearn.server.dto.response.QrTokenResponse;
import com.unilearn.server.exception.EntryNotFoundException;
import com.unilearn.server.exception.ValidationException;
import com.unilearn.server.model.AttendanceSession;
import com.unilearn.server.repository.AttendanceSessionRepository;
import com.unilearn.server.security.OwnershipValidator;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.time.Instant;
import java.util.Base64;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Slf4j
@Service
@RequiredArgsConstructor
public class AttendanceQrTokenService {

    private static final int TOKEN_BYTE_LENGTH = 16;
    private static final long EXPIRY_SECONDS = 90; // Valid for 90 seconds

    private final AttendanceSessionRepository attendanceSessionRepository;
    private final OwnershipValidator ownershipValidator;
    private final SecureRandom secureRandom = new SecureRandom();

    // Cache active tokens
    private final Map<String, QrTokenResponse> tokenStore = new ConcurrentHashMap<>();
    private final Map<Long, String> sessionTokenMap = new ConcurrentHashMap<>();

    public QrTokenResponse generateOrRefreshToken(Long sessionId) {
        if (sessionId == null) {
            throw new ValidationException("Session ID cannot be null");
        }

        AttendanceSession session = attendanceSessionRepository.findById(sessionId)
                .orElseThrow(() -> new EntryNotFoundException("Attendance session not found with ID: " + sessionId));

        Long offeringId = session.getCourseOffering().getOfferingId();
        // only a lecturer of this course can show the QR code
        ownershipValidator.checkLecturerOfferingAccess(offeringId);

        // keep the last code working until it expires (a student may be scanning it now)
        Instant now = Instant.now();
        tokenStore.entrySet().removeIf(e -> now.isAfter(e.getValue().getExpiresAt()));

        // Generate random token
        byte[] randomBytes = new byte[TOKEN_BYTE_LENGTH];
        secureRandom.nextBytes(randomBytes);
        String randomStr = Base64.getUrlEncoder().withoutPadding().encodeToString(randomBytes);
        String token = "QR-" + sessionId + "-" + randomStr;

        Instant expiresAt = Instant.now().plusSeconds(EXPIRY_SECONDS);

        QrTokenResponse response = QrTokenResponse.builder()
                .token(token)
                .sessionId(sessionId)
                .offeringId(offeringId)
                .expiresInSeconds(EXPIRY_SECONDS)
                .expiresAt(expiresAt)
                .build();

        tokenStore.put(token, response);
        sessionTokenMap.put(sessionId, token);

        return response;
    }

    public QrTokenResponse validateToken(String token) {
        if (token == null || token.trim().isEmpty()) {
            throw new ValidationException("QR token cannot be empty");
        }

        String cleanToken = token.trim();
        QrTokenResponse info = tokenStore.get(cleanToken);

        if (info == null) {
            throw new ValidationException("Invalid QR attendance token. Please scan the current live code displayed by your lecturer.");
        }

        if (Instant.now().isAfter(info.getExpiresAt())) {
            tokenStore.remove(cleanToken);
            sessionTokenMap.remove(info.getSessionId(), cleanToken);
            throw new ValidationException("QR attendance token has expired. Please ask your lecturer to refresh the code.");
        }

        return info;
    }
}
