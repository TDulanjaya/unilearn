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
public class ProctoringFlagRequest {

    @NotNull(message = "Attempt ID is required")
    private Long attemptId;

    @NotBlank(message = "Flag type is required")
    @Size(max = 50, message = "Flag type must not exceed 50 characters")
    private String flagType;

    private String notes;
}
