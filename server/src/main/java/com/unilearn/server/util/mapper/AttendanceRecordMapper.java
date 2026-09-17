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
        com.unilearn.server.model.CourseOffering offering = (record.getSession() != null) ? record.getSession().getCourseOffering() : null;
        String courseCode = (offering != null && offering.getCourse() != null) ? offering.getCourse().getCode() : null;
        String courseName = (offering != null && offering.getCourse() != null) ? offering.getCourse().getTitle() : null;

        return AttendanceRecordResponse.builder()
                .recordId(record.getRecordId())
                .sessionId(record.getSession() != null ? record.getSession().getSessionId() : null)
                .offeringId(offering != null ? offering.getOfferingId() : null)
                .courseCode(courseCode)
                .courseName(courseName)
                .sessionDate(record.getSession() != null ? record.getSession().getSessionDate() : null)
                .studentId(record.getStudent() != null ? record.getStudent().getStudentId() : null)
                .studentName(record.getStudent() != null && record.getStudent().getUser() != null ? record.getStudent().getUser().getFullName() : null)
                .status(record.getStatus())
                .markedAt(LocalDateTime.now())
                .build();
    }
}
