package com.unilearn.server.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;

@Service
public class JwtService {

    // token types, so a refresh token can't be used as a login token
    private static final String TYPE_CLAIM = "typ";
    private static final String ACCESS = "access";
    private static final String REFRESH = "refresh";
    // user's token version, old tokens stop working when it goes up
    private static final String VERSION_CLAIM = "ver";

    @Value("${jwt.secret:}")
    private String jwtSecret;

    @Value("${jwt.expiration-ms:900000}") // 15 minutes
    private long jwtExpirationMs;

    @Value("${jwt.refresh-expiration-ms:604800000}") // 7 days
    private long jwtRefreshExpirationMs;

    // stop the app early if the secret is missing or too short
    @PostConstruct
    void checkSecret() {
        if (jwtSecret == null || jwtSecret.getBytes(StandardCharsets.UTF_8).length < 32) {
            throw new IllegalStateException("JWT_SECRET is missing or too short. Set it in server/.env (at least 32 characters).");
        }
    }

    private SecretKey getSigningKey() {
        byte[] keyBytes = jwtSecret.getBytes(StandardCharsets.UTF_8);
        return Keys.hmacShaKeyFor(keyBytes);
    }

    public String generateAccessToken(String email, String role, Integer tokenVersion) {
        return Jwts.builder()
                .subject(email)
                .claim("role", role)
                .claim(TYPE_CLAIM, ACCESS)
                .claim(VERSION_CLAIM, tokenVersion != null ? tokenVersion : 0)
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + jwtExpirationMs))
                .signWith(getSigningKey())
                .compact();
    }

    public String generateRefreshToken(String email, Integer tokenVersion) {
        return Jwts.builder()
                .subject(email)
                .claim(TYPE_CLAIM, REFRESH)
                .claim(VERSION_CLAIM, tokenVersion != null ? tokenVersion : 0)
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + jwtRefreshExpirationMs))
                .signWith(getSigningKey())
                .compact();
    }

    public String getEmailFromToken(String token) {
        Claims claims = Jwts.parser()
                .verifyWith(getSigningKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
        return claims.getSubject();
    }

    public boolean isAccessToken(String token) {
        return ACCESS.equals(getTokenType(token));
    }

    public boolean isRefreshToken(String token) {
        return REFRESH.equals(getTokenType(token));
    }

    // true only if the token has a "ver" claim equal to the user's current version
    public boolean isTokenVersionValid(String token, Integer currentVersion) {
        try {
            Claims claims = Jwts.parser()
                    .verifyWith(getSigningKey())
                    .build()
                    .parseSignedClaims(token)
                    .getPayload();
            Object ver = claims.get(VERSION_CLAIM);
            // tokens made before this change have no version, so they are rejected
            if (!(ver instanceof Number)) {
                return false;
            }
            int expected = currentVersion != null ? currentVersion : 0;
            return ((Number) ver).intValue() == expected;
        } catch (Exception e) {
            return false;
        }
    }

    private String getTokenType(String token) {
        try {
            Claims claims = Jwts.parser()
                    .verifyWith(getSigningKey())
                    .build()
                    .parseSignedClaims(token)
                    .getPayload();
            return claims.get(TYPE_CLAIM, String.class);
        } catch (Exception e) {
            return null;
        }
    }

    public boolean validateToken(String token) {
        try {
            Jwts.parser()
                    .verifyWith(getSigningKey())
                    .build()
                    .parseSignedClaims(token);
            return true;
        } catch (Exception e) {
            return false;
        }
    }
}
