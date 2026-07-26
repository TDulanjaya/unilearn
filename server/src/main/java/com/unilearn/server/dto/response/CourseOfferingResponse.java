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
public class CourseOfferingResponse {
    private Long offeringId;
    private Long courseId;
    private String courseCode;
    private String courseName;
    private Long batchId;
    private String batchName;
    private Long lecturerId;
    private String lecturerName;
    private Long semesterId;
    private String semesterLabel;
    private LocalDateTime createdAt;
    private List<EnrollmentResponse> enrollments;
    private List<MaterialResponse> materials;
    private List<AssignmentResponse> assignments;
    private List<ExamResponse> exams;
    private List<AttendanceSessionResponse> attendanceSessions;
    private List<PersonalResourceResponse> personalResources;
}
