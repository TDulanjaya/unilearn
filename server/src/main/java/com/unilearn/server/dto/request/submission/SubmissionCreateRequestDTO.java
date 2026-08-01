package com.unilearn.server.dto.request.submission;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class SubmissionCreateRequestDTO {

    @NotNull(message = "Assignment ID is required")
    @Positive(message = "Assignment ID must be positive")
    private Long assignmentId;

    @NotNull(message = "Student ID is required")
    @Positive(message = "Student ID must be positive")
    private Long studentId;

    @Size(max = 500, message = "File URL must not exceed 500 characters")
    private String fileUrl;
}
