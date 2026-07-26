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
public class BatchRequestDTO {

    @NotNull(message = "Department ID is required")
    private Long departmentId;

    @NotNull(message = "Academic year ID is required")
    private Long academicYearId;

    @NotBlank(message = "Batch name is required")
    @Size(max = 50, message = "Batch name must not exceed 50 characters")
    private String name;
}
