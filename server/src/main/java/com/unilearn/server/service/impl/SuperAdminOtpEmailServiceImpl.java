package com.unilearn.server.service.impl;

import com.unilearn.server.model.User;
import com.unilearn.server.service.SuperAdminOtpEmailService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.MailException;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class SuperAdminOtpEmailServiceImpl implements SuperAdminOtpEmailService {

    private final JavaMailSender mailSender;

    @Value("${app.otp.from:${spring.mail.username:}}")
    private String fromAddress;

    @Value("${app.otp.log-to-console:false}")
    private boolean logOtpToConsole;

    @Override
    public void sendOtp(User user, String otp) {
        if (logOtpToConsole) {
            log.info("===============================================================");
            log.info(">>> SUPERADMIN OTP VERIFICATION CODE: [{}] <<<", otp);
            log.info(">>> Recipient: {} | Valid for 10 minutes", user.getEmail());
            log.info("===============================================================");
        } else {
            log.info("Dispatching superadmin OTP verification email to recipient: {}", user.getEmail());
        }

        try {
            SimpleMailMessage message = new SimpleMailMessage();
            if (fromAddress != null && !fromAddress.isBlank()) {
                message.setFrom(fromAddress);
            }
            message.setTo(user.getEmail());
            message.setSubject("UniLearn superadmin verification code");
            message.setText("Your UniLearn verification code is " + otp
                    + ". It expires in 10 minutes and can be used only once.");
            mailSender.send(message);
            log.info("Successfully dispatched OTP email via SMTP to {}", user.getEmail());
        } catch (Exception e) {
            log.error("Failed to send OTP email to {}: {}", user.getEmail(), e.getMessage());
            if (!logOtpToConsole) {
                if (e instanceof RuntimeException re) {
                    throw re;
                }
                throw new RuntimeException("Failed to dispatch OTP email", e);
            }
            log.warn("SMTP email dispatch failed, but proceeding because APP_OTP_LOG_TO_CONSOLE is enabled. Use the OTP from the console log.");
        }
    }
}
