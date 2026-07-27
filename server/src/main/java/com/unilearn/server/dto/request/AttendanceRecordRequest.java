package com.unilearn.server.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
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
public class AttendanceRecordRequest {

    @NotNull(message = "Session ID is required")
    private Long sessionId;

    @NotNull(message = "Student ID is required")
    private Long studentId;

    @NotBlank(message = "Status is required")
    private String status;
}
