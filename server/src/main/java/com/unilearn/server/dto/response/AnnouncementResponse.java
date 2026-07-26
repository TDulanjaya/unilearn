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
public class AnnouncementResponse {
    private Long announcementId;
    private String title;
    private String content;
    private Long postedBy;
    private String postedByName;
    private String scope;
    private Long offeringId;
    private Long departmentId;
    private Long facultyId;
    private LocalDateTime createdAt;
    private LocalDateTime postedAt;
}
