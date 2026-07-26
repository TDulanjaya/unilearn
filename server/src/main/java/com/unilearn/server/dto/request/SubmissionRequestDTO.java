package com.unilearn.server.dto.request;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

import java.math.BigDecimal;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@ToString
@Builder
public class SubmissionRequestDTO {

    @NotNull(message = "Assignment ID is required")
    private Long assignmentId;

    @NotNull(message = "Student ID is required")
    private Long studentId;

    @Size(max = 500, message = "File URL must not exceed 500 characters")
    private String fileUrl;

    private Boolean isResubmission;

    private BigDecimal grade;

    private String feedback;

    private Long gradedById;
}
