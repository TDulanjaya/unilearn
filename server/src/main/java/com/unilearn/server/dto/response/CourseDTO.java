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
public class CourseDTO {
    private Long courseId;
    private String code;
    private String name;
    private String title;
    private Long departmentId;
    private String departmentName;
    private Integer credits;
    private Integer creditHours;
    private String description;
    private String syllabusVersion;
    private LocalDateTime createdAt;
}
