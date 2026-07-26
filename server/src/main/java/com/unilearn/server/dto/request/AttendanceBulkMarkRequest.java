package com.unilearn.server.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

import java.util.List;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@ToString
@Builder
public class AttendanceBulkMarkRequest {

    @NotNull(message = "Session ID is required")
    @Positive(message = "Session ID must be positive")
    private Long sessionId;

    @NotEmpty(message = "Records list cannot be empty")
    @Valid
    private List<StudentAttendanceItem> records;

    @Getter
    @Setter
    @AllArgsConstructor
    @NoArgsConstructor
    @ToString
    @Builder
    public static class StudentAttendanceItem {

        @NotNull(message = "Student ID is required")
        @Positive(message = "Student ID must be positive")
        private Long studentId;

        @NotBlank(message = "Status is required")
        private String status;
    }
}
