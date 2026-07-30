package com.unilearn.server.util;

import com.unilearn.server.dto.request.AttendanceSessionRequest;
import com.unilearn.server.dto.response.AttendanceSessionResponse;
import com.unilearn.server.exception.ValidationException;
import com.unilearn.server.model.AttendanceSession;
import com.unilearn.server.model.CourseOffering;
import com.unilearn.server.model.Lecturer;
import org.springframework.stereotype.Component;

import java.util.Collections;

@Component
public class AttendanceSessionMapper {

    public AttendanceSession toAttendanceSession(AttendanceSessionRequest request, CourseOffering offering, Lecturer lecturer) {
        if (request == null) {
            throw new ValidationException("AttendanceSession request cannot be null");
        }
        return AttendanceSession.builder()
                .courseOffering(offering)
                .sessionDate(request.getSessionDate())
                .markedBy(lecturer)
                .build();
    }

    public AttendanceSessionResponse toAttendanceSessionResponse(AttendanceSession session) {
        if (session == null) {
            throw new ValidationException("AttendanceSession cannot be null");
        }
        return AttendanceSessionResponse.builder()
                .sessionId(session.getSessionId())
                .offeringId(session.getCourseOffering() != null ? session.getCourseOffering().getOfferingId() : null)
                .courseCode(session.getCourseOffering() != null && session.getCourseOffering().getCourse() != null ? session.getCourseOffering().getCourse().getCode() : null)
                .courseName(session.getCourseOffering() != null && session.getCourseOffering().getCourse() != null ? session.getCourseOffering().getCourse().getTitle() : null)
                .sessionDate(session.getSessionDate())
                .markedByLecturerId(session.getMarkedBy() != null ? session.getMarkedBy().getLecturerId() : null)
                .markedByLecturerName(session.getMarkedBy() != null && session.getMarkedBy().getUser() != null ? session.getMarkedBy().getUser().getFullName() : null)
                .attendanceRecords(Collections.emptyList())
                .build();
    }
}
