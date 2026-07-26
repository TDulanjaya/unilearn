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
public class PersonalResourceResponse {
    private Long resourceId;
    private Long studentId;
    private Long offeringId;
    private String courseCode;
    private String fileName;
    private String title;
    private String fileUrl;
    private Long fileSizeBytes;
    private Integer fileSizeKb;
    private LocalDateTime uploadedAt;
}
