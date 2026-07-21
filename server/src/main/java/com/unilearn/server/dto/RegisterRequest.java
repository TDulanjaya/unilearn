package com.unilearn.server.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class RegisterRequest {
    // Core User Details
    private String fullName;
    private String email;
    private String password;
    private String phone;
    private String role; // "student", "lecturer", etc.

    // Student-specific fields (Optional - used if role == "student")
    private String studentNo;
    private Long departmentId;
    private Long batchId;
    private Integer enrollmentYear;

    // Lecturer-specific fields (Optional - used if role == "lecturer")
    private String designation;
}
