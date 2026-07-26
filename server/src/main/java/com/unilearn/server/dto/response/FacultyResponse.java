package com.unilearn.server.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@ToString
@Builder
public class FacultyResponse {
    private Long facultyId;
    private String name;
    private String code;
    private Long headUserId;
    private String headUserName;
    private LocalDateTime createdAt;
    private List<DepartmentResponse> departments;
}
