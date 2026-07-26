package com.unilearn.server.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
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
public class StudentRequest {

    @NotNull(message = "User ID is required")
    private Long userId;

    @NotBlank(message = "Student number is required")
    @Size(max = 30, message = "Student number must not exceed 30 characters")
    private String studentNo;

    @NotNull(message = "Department ID is required")
    private Long departmentId;

    @NotNull(message = "Batch ID is required")
    private Long batchId;

    @NotNull(message = "Enrollment year is required")
    private Integer enrollmentYear;

    @Size(max = 20, message = "Fee status must not exceed 20 characters")
    private String feeStatus;
}
