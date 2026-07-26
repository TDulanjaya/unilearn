package com.unilearn.server.dto.request;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
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
    @Positive(message = "User ID must be positive")
    private Long userId;

    @NotBlank(message = "Student number is required")
    @Size(max = 30, message = "Student number must not exceed 30 characters")
    private String studentNo;

    @NotNull(message = "Department ID is required")
    @Positive(message = "Department ID must be positive")
    private Long departmentId;

    @NotNull(message = "Batch ID is required")
    @Positive(message = "Batch ID must be positive")
    private Long batchId;

    @NotNull(message = "Enrollment year is required")
    @Min(value = 2000, message = "Enrollment year must be at least 2000")
    @Max(value = 2100, message = "Enrollment year must not exceed 2100")
    private Integer enrollmentYear;
}
