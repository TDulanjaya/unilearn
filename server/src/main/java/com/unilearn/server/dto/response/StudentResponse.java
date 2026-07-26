package com.unilearn.server.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

import java.util.List;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@ToString
@Builder
public class StudentResponse {
    private Long studentId;
    private Long userId;
    private String fullName;
    private String email;
    private String studentNo;
    private Long departmentId;
    private String departmentName;
    private Long batchId;
    private String batchName;
    private List<EnrollmentResponse> enrollments;
    private List<SubmissionResponse> submissions;
    private List<ExamAttemptResponse> examAttempts;
    private List<PersonalResourceResponse> personalResources;
    private List<AttendanceRecordResponse> attendanceRecords;
}
