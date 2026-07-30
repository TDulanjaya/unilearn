package com.unilearn.server.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

import java.time.LocalDate;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@ToString
@Builder
public class HodDeanAssignmentResponse {
    private Long assignmentId;
    private Long userId;
    private String userName;
    private String userEmail;
    private String scopeType;
    private Long facultyId;
    private String facultyName;
    private Long departmentId;
    private String departmentName;
    private Boolean active;
    private LocalDate endDate;
}
