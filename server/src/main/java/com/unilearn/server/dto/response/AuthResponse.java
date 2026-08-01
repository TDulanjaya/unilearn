package com.unilearn.server.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@ToString
@Builder
public class AuthResponse {
    private String token;
    private String tokenType;
    private Long userId;
    private String fullName;
    private String email;
    private String role;
    private String status;
}
