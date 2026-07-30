package com.unilearn.server.service;

import com.unilearn.server.dto.request.AttendanceBulkMarkRequest;
import com.unilearn.server.dto.request.AttendanceRecordRequest;
import com.unilearn.server.dto.response.AttendanceRecordResponse;

import java.util.List;

/**
 * Service interface for managing attendance records.
 */
public interface AttendanceRecordService {

    AttendanceRecordResponse markAttendance(AttendanceRecordRequest request);

    List<AttendanceRecordResponse> bulkMarkAttendance(AttendanceBulkMarkRequest request);

    List<AttendanceRecordResponse> getAttendanceForSession(Long sessionId);

    List<AttendanceRecordResponse> getAttendanceForStudent(Long studentId);
}
