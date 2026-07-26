package com.unilearn.server.dto.request;

import jakarta.validation.constraints.NotBlank;
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
public class FacultyRequest {

    @NotBlank(message = "Faculty name is required")
    @Size(max = 150, message = "Faculty name must not exceed 150 characters")
    private String name;

    @NotBlank(message = "Faculty code is required")
    @Size(max = 20, message = "Faculty code must not exceed 20 characters")
    private String code;

    private Long deanUserId;
}
