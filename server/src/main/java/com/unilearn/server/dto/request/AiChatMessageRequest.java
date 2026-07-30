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
public class AiChatMessageRequest {

    @NotNull(message = "Student ID is required")
    private Long studentId;

    @NotNull(message = "Offering ID is required")
    private Long offeringId;

    @NotBlank(message = "Role is required")
    @Size(max = 10, message = "Role must not exceed 10 characters")
    private String role;

    @NotBlank(message = "Content is required")
    private String content;
}
