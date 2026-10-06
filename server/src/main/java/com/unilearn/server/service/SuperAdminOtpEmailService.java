package com.unilearn.server.service;

import com.unilearn.server.model.User;

public interface SuperAdminOtpEmailService {

    void sendOtp(User user, String otp);
}
