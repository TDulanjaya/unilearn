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
public class HodDeanAssignmentRequest {

    @NotNull(message = "User ID is required")
    private Long userId;

    @NotBlank(message = "Scope type is required")
    @Size(max = 20, message = "Scope type must not exceed 20 characters")
    private String scopeType;

    private Long facultyId;

    private Long departmentId;
}
