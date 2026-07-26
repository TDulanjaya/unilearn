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
public class DepartmentResponse {
    private Long departmentId;
    private String name;
    private String code;
    private Long facultyId;
    private String facultyName;
    private Long hodUserId;
    private String hodUserName;
    private LocalDateTime createdAt;
}
