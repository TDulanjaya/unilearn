package com.unilearn.server.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

import java.time.LocalDateTime;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@ToString
@Builder
public class MaterialResponse {
    private Long materialId;
    private Long offeringId;
    private String title;
    private String resourceType;
    private String fileUrl;
    private String linkUrl;
    private String externalLink;
    private LocalDateTime uploadedAt;
    private Long uploadedById;
    private String uploadedByName;
}
