package com.unilearn.server.service.impl;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.unilearn.server.model.User;
import com.unilearn.server.service.SuperAdminOtpEmailService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.List;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class SuperAdminOtpEmailServiceImpl implements SuperAdminOtpEmailService {

    private final JavaMailSender mailSender;
    private final ObjectMapper objectMapper;

    private final HttpClient httpClient = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(10))
            .build();

    @Value("${resend.api-key:}")
    private String resendApiKey;

    @Value("${resend.from:UniLearn <onboarding@resend.dev>}")
    private String resendFrom;

    @Value("${app.otp.from:${spring.mail.username:}}")
    private String fromAddress;

    @Value("${app.otp.log-to-console:false}")
    private boolean logOtpToConsole;

    @Override
    public void sendOtp(User user, String otp) {
        if (logOtpToConsole) {
            log.info("Super admin OTP for {}: [{}]", user.getEmail(), otp);
        }

        try {
            if (resendApiKey != null && !resendApiKey.isBlank()) {
                sendViaResend(user.getEmail(), otp);
            } else {
                sendViaSmtp(user.getEmail(), otp);
            }
        } catch (Exception e) {
            log.error("Failed to send OTP email to {}: {}", user.getEmail(), e.getMessage());
            if (!logOtpToConsole) {
                if (e instanceof RuntimeException re) {
                    throw re;
                }
                throw new RuntimeException("Failed to send OTP email", e);
            }
            log.warn("Email delivery failed; check console log for OTP since APP_OTP_LOG_TO_CONSOLE is enabled");
        }
    }

    private void sendViaResend(String toEmail, String otp) throws Exception {
        String sender = (resendFrom != null && !resendFrom.isBlank()) ? resendFrom : "UniLearn <onboarding@resend.dev>";

        Map<String, Object> payload = Map.of(
                "from", sender,
                "to", List.of(toEmail),
                "subject", "UniLearn Super Admin Verification Code",
                "html", "<div style=\"font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;\">"
                        + "<h2 style=\"color: #1f2937; margin-bottom: 8px;\">UniLearn Verification Code</h2>"
                        + "<p style=\"color: #4b5563; font-size: 15px;\">Use the verification code below to complete sign-in to the Super Admin portal:</p>"
                        + "<div style=\"background-color: #f3f4f6; border-radius: 6px; padding: 16px; text-align: center; margin: 20px 0;\">"
                        + "<span style=\"font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #2563eb;\">" + otp + "</span>"
                        + "</div>"
                        + "<p style=\"color: #6b7280; font-size: 13px;\">This code is valid for <strong>10 minutes</strong> and can only be used once.</p>"
                        + "<p style=\"color: #9ca3af; font-size: 12px; margin-top: 16px;\">If you did not request this code, please secure your account immediately.</p>"
                        + "</div>"
        );

        String json = objectMapper.writeValueAsString(payload);

        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create("https://api.resend.com/emails"))
                .header("Authorization", "Bearer " + resendApiKey.trim())
                .header("Content-Type", "application/json")
                .timeout(Duration.ofSeconds(10))
                .POST(HttpRequest.BodyPublishers.ofString(json, StandardCharsets.UTF_8))
                .build();

        HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

        if (response.statusCode() >= 200 && response.statusCode() < 300) {
            log.info("Sent OTP email via Resend to {}", toEmail);
        } else {
            log.error("Resend API failed for {}: status={}, response={}", toEmail, response.statusCode(), response.body());
            throw new RuntimeException("Resend API error: " + response.statusCode());
        }
    }

    private void sendViaSmtp(String toEmail, String otp) {
        SimpleMailMessage message = new SimpleMailMessage();
        if (fromAddress != null && !fromAddress.isBlank()) {
            message.setFrom(fromAddress);
        }
        message.setTo(toEmail);
        message.setSubject("UniLearn superadmin verification code");
        message.setText("Your UniLearn verification code is " + otp
                + ". It expires in 10 minutes and can be used only once.");
        mailSender.send(message);
        log.info("Sent OTP email via SMTP to {}", toEmail);
    }
}
