package com.unilearn.server.dto.response;

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
public class BatchResponse {
    private Long batchId;
    private String name;
    private Long departmentId;
    private String departmentName;
    private Long academicYearId;
    private String academicYearName;
    private String academicYearLabel;
    private Integer enrollmentYear;
}
