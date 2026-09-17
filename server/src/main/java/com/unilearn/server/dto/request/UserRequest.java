package com.unilearn.server.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
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
public class UserRequest {

    @NotBlank(message = "Full name is required")
    @Size(max = 100, message = "Full name must not exceed 100 characters")
    private String fullName;

    @NotBlank(message = "Email is required")
    @Email(message = "Email should be valid")
    @Size(max = 100, message = "Email must not exceed 100 characters")
    private String email;

    @Size(max = 100, message = "Password must not exceed 100 characters")
    private String password;

    @Size(max = 30, message = "Phone number must not exceed 30 characters")
    private String phone;

    @Size(max = 255, message = "Photo URL must not exceed 255 characters")
    private String photoUrl;

    @NotBlank(message = "Role is required")
    @Pattern(regexp = "^(?i)(STUDENT|LECTURER|HOD_DEAN|STAFF_ADMIN|GUEST_LECTURER|EXAMINER|SUPER_ADMIN)$",
            message = "Role must be one of: STUDENT, LECTURER, HOD_DEAN, STAFF_ADMIN, GUEST_LECTURER, EXAMINER, SUPER_ADMIN")
    private String role;

    @Pattern(regexp = "^(?i)(active|inactive|suspended)$", message = "Status must be one of: active, inactive, suspended")
    private String status;

    private Long departmentId;

    private Long batchId;

    private String designation;

    private Long facultyId;

    private String scopeType;
}
