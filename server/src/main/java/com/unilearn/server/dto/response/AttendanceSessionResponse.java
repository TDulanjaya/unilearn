package com.unilearn.server.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@ToString
@Builder
public class AttendanceSessionResponse {
    private Long sessionId;
    private Long offeringId;
    private String courseCode;
    private String courseName;
    private LocalDate sessionDate;
    private LocalTime startTime;
    private LocalTime endTime;
    private Integer totalStudents;
    private Integer presentCount;
    private Integer absentCount;
    private Integer lateCount;
    private Long markedById;
    private String markedByName;
    private Long markedByLecturerId;
    private String markedByLecturerName;
    private List<AttendanceRecordResponse> attendanceRecords;
}
