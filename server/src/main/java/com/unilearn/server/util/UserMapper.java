package com.unilearn.server.util;

import com.unilearn.server.dto.request.UserRequest;
import com.unilearn.server.dto.response.UserResponse;
import com.unilearn.server.exception.ValidationException;
import com.unilearn.server.model.User;
import org.springframework.stereotype.Component;

@Component
public class UserMapper {

    public User toUser(UserRequest request, String passwordHash) {
        if (request == null) {
            throw new ValidationException("User request cannot be null");
        }
        return User.builder()
                .fullName(request.getFullName())
                .email(request.getEmail())
                .passwordHash(passwordHash)
                .phone(request.getPhone())
                .photoUrl(request.getPhotoUrl())
                .role(request.getRole())
                .status(request.getStatus() != null ? request.getStatus() : "active")
                .build();
    }

    public UserResponse toUserResponse(User user) {
        if (user == null) {
            throw new ValidationException("User cannot be null");
        }
        return UserResponse.builder()
                .userId(user.getUserId())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .phone(user.getPhone())
                .photoUrl(user.getPhotoUrl())
                .role(user.getRole())
                .status(user.getStatus())
                .createdAt(user.getCreatedAt())
                .build();
    }
}
