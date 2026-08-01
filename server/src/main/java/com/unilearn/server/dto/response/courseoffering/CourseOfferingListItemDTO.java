package com.unilearn.server.dto.response.courseoffering;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class CourseOfferingListItemDTO {

    private Long offeringId;
    private String courseCode;
    private String courseTitle;
    private String batchName;
    private String semesterName;
    private String lecturerName;
    private Long enrollmentCount;
}
