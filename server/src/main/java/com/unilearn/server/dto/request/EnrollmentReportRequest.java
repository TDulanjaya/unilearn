package com.unilearn.server.dto.request;

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
public class EnrollmentReportRequest {
    private Long facultyId;
    private Long departmentId;
    private Long academicYearId;
    private Long semesterId;
}
