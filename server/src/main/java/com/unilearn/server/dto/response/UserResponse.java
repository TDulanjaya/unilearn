package com.unilearn.server.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

import java.time.LocalDateTime;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@ToString
@Builder
public class UserResponse {
    private Long userId;
    private String fullName;
    private String email;
    private String phone;
    private String photoUrl;
    private String role;
    private String status;
    private LocalDateTime createdAt;
    private String scopeLevel;
    private Long facultyId;
    private String facultyName;
    private Long departmentId;
    private String departmentName;

    public boolean isActive() {
        return "active".equalsIgnoreCase(status);
    }
}

