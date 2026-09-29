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

    // Derived from JWT principal in controller
    private Long studentId;

    @NotNull(message = "Offering ID is required")
    private Long offeringId;

    // Defaults to 'user' if not specified
    @Size(max = 10, message = "Role must not exceed 10 characters")
    private String role;

    @NotBlank(message = "Content is required")
    private String content;

    // scope: course_materials, my_notes, or both (defaults to both)
    private String sourceScope;
}
