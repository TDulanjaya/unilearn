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
public class MaterialRequestDTO {

    @NotNull(message = "Offering ID is required")
    private Long offeringId;

    @NotBlank(message = "Material title is required")
    @Size(max = 200, message = "Material title must not exceed 200 characters")
    private String title;

    @NotBlank(message = "Resource type is required")
    @Size(max = 20, message = "Resource type must not exceed 20 characters")
    private String resourceType;

    @Size(max = 500, message = "File URL must not exceed 500 characters")
    private String fileUrl;

    @Size(max = 500, message = "Link URL must not exceed 500 characters")
    private String linkUrl;

    @NotNull(message = "Uploader lecturer ID is required")
    private Long uploadedById;
}
