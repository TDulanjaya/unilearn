package com.unilearn.server.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

@Component
@Slf4j
public class AuthRateLimitFilter extends OncePerRequestFilter {

    private static final Set<String> RATE_LIMITED_PATHS = Set.of(
            "/api/v1/auth/login",
            "/api/v1/auth/register"
    );

    // Max requests per IP
    private static final double CAPACITY = 15.0;
    // Refill rate: 15 per minute
    private static final double REFILL_PER_MILLI = CAPACITY / 60000.0;

    private static class TokenBucket {
        double tokens;
        long lastRefillTime;

        TokenBucket(double tokens, long now) {
            this.tokens = tokens;
            this.lastRefillTime = now;
        }

        synchronized boolean tryConsume(double cost, long now) {
            double elapsed = now - lastRefillTime;
            tokens = Math.min(CAPACITY, tokens + (elapsed * REFILL_PER_MILLI));
            lastRefillTime = now;

            if (tokens >= cost) {
                tokens -= cost;
                return true;
            }
            return false;
        }
    }

    private final Map<String, TokenBucket> buckets = new ConcurrentHashMap<>();
    private long lastCleanupTime = System.currentTimeMillis();

    // only read X-Forwarded-For when the app runs behind a proxy we trust
    @Value("${app.security.trust-forwarded-for:false}")
    private boolean trustForwardedFor;

    private String getClientIp(HttpServletRequest request) {
        if (!trustForwardedFor) {
            return request.getRemoteAddr();
        }
        String xf = request.getHeader("X-Forwarded-For");
        if (xf != null && !xf.isBlank()) {
            return xf.split(",")[0].trim();
        }
        String xr = request.getHeader("X-Real-IP");
        if (xr != null && !xr.isBlank()) {
            return xr.trim();
        }
        return request.getRemoteAddr();
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {
        String path = request.getRequestURI();
        String method = request.getMethod();

        if ("POST".equalsIgnoreCase(method) && RATE_LIMITED_PATHS.contains(path)) {
            String clientIp = getClientIp(request);
            long now = System.currentTimeMillis();

            // Clean up every 10 minutes
            if (now - lastCleanupTime > 600_000) {
                lastCleanupTime = now;
                buckets.entrySet().removeIf(e -> (now - e.getValue().lastRefillTime) > 600_000);
            }

            TokenBucket bucket = buckets.computeIfAbsent(clientIp, k -> new TokenBucket(CAPACITY, now));
            if (!bucket.tryConsume(1.0, now)) {
                log.warn("Rate limit exceeded for IP: {} on endpoint: {}", clientIp, path);
                response.setStatus(429); // 429 Too Many Requests
                response.setContentType("application/json");
                response.setHeader("Retry-After", "60");
                response.getWriter().write("{\"error\": \"Too Many Requests\", \"message\": \"Rate limit exceeded. Please wait a minute before retrying.\"}");
                return;
            }
        }

        filterChain.doFilter(request, response);
    }
}
