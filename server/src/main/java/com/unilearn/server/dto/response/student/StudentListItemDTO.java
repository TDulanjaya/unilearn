package com.unilearn.server.dto.response.student;

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
public class StudentListItemDTO {

    private Long studentId;
    private String fullName;
    private String studentNo;
    private String departmentName;
    private String batchName;
}
