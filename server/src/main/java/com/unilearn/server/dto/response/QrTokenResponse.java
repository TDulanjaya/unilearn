package com.unilearn.server.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class QrTokenResponse {
    private String token;
    private Long sessionId;
    private Long offeringId;
    private long expiresInSeconds;
    private Instant expiresAt;
}
