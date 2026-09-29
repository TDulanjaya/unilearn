package com.unilearn.server.service;

import com.unilearn.server.dto.request.AttendanceBulkMarkRequest;
import com.unilearn.server.dto.request.AttendanceRecordRequest;
import com.unilearn.server.dto.response.AttendanceRecordResponse;

import java.util.List;

// Attendance records service
public interface AttendanceRecordService {

    AttendanceRecordResponse markAttendance(AttendanceRecordRequest request);

    List<AttendanceRecordResponse> bulkMarkAttendance(AttendanceBulkMarkRequest request);

    List<AttendanceRecordResponse> getAttendanceForSession(Long sessionId);

    List<AttendanceRecordResponse> getAttendanceForStudent(Long studentId);

    AttendanceRecordResponse checkIn(String sessionCode, Long studentId);
}
