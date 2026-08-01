package com.unilearn.server.util.mapper;

import com.unilearn.server.dto.request.AttendanceRecordRequest;
import com.unilearn.server.dto.response.AttendanceRecordResponse;
import com.unilearn.server.exception.ValidationException;
import com.unilearn.server.model.AttendanceRecord;
import com.unilearn.server.model.AttendanceSession;
import com.unilearn.server.model.Student;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Component
public class AttendanceRecordMapper {

    public AttendanceRecord toAttendanceRecord(AttendanceRecordRequest request, AttendanceSession session, Student student) {
        if (request == null) {
            throw new ValidationException("AttendanceRecord request cannot be null");
        }
        return AttendanceRecord.builder()
                .session(session)
                .student(student)
                .status(request.getStatus())
                .build();
    }

    public AttendanceRecordResponse toAttendanceRecordResponse(AttendanceRecord record) {
        if (record == null) {
            throw new ValidationException("AttendanceRecord cannot be null");
        }
        return AttendanceRecordResponse.builder()
                .recordId(record.getRecordId())
                .sessionId(record.getSession() != null ? record.getSession().getSessionId() : null)
                .studentId(record.getStudent() != null ? record.getStudent().getStudentId() : null)
                .studentName(record.getStudent() != null && record.getStudent().getUser() != null ? record.getStudent().getUser().getFullName() : null)
                .status(record.getStatus())
                .markedAt(LocalDateTime.now())
                .build();
    }
}
