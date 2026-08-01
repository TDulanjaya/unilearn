package com.unilearn.server.util.mapper;

import com.unilearn.server.dto.response.CourseOfferingLecturerResponse;
import com.unilearn.server.exception.ValidationException;
import com.unilearn.server.model.CourseOffering;
import com.unilearn.server.model.CourseOfferingLecturer;
import com.unilearn.server.model.Lecturer;
import org.springframework.stereotype.Component;

@Component
public class CourseOfferingLecturerMapper {

    public CourseOfferingLecturer toCourseOfferingLecturer(CourseOffering offering, Lecturer lecturer) {
        return CourseOfferingLecturer.builder()
                .courseOffering(offering)
                .lecturer(lecturer)
                .build();
    }

    public CourseOfferingLecturerResponse toCourseOfferingLecturerResponse(CourseOfferingLecturer col) {
        if (col == null) {
            throw new ValidationException("CourseOfferingLecturer cannot be null");
        }
        return CourseOfferingLecturerResponse.builder()
                .offeringId(col.getCourseOffering() != null ? col.getCourseOffering().getOfferingId() : null)
                .lecturerId(col.getLecturer() != null ? col.getLecturer().getLecturerId() : null)
                .lecturerName(col.getLecturer() != null && col.getLecturer().getUser() != null ? col.getLecturer().getUser().getFullName() : null)
                .build();
    }
}
