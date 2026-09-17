package com.unilearn.server.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@ToString
@Builder
public class AttendanceRecordResponse {
    private Long recordId;
    private Long sessionId;
    private Long offeringId;
    private String courseCode;
    private String courseName;
    private LocalDate sessionDate;
    private Long studentId;
    private String studentName;
    private String status;
    private LocalDateTime markedAt;
}
