package com.unilearn.server.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@ToString
public class RegisterRequest {

    @NotBlank(message = "Full name is required")
    @Size(max = 150, message = "Full name must not exceed 150 characters")
    private String fullName;

    @NotBlank(message = "Email is required")
    @Email(message = "Email should be valid")
    @Size(max = 150, message = "Email must not exceed 150 characters")
    private String email;

    @NotBlank(message = "Password is required")
    @Size(min = 8, max = 100, message = "Password must be between 8 and 100 characters")
    private String password;

    @Size(max = 30, message = "Phone number must not exceed 30 characters")
    private String phone;

    @NotBlank(message = "Role is required")
    @Pattern(regexp = "^(?i)(STUDENT|LECTURER|HOD_DEAN|STAFF_ADMIN|GUEST_LECTURER|SUPER_ADMIN)$", message = "Role must be one of: STUDENT, LECTURER, HOD_DEAN, STAFF_ADMIN, GUEST_LECTURER, SUPER_ADMIN")
    private String role;

    private Long batchId;

    private Long departmentId;

    private String designation;

    private Long facultyId;

    private String scopeType;
}
