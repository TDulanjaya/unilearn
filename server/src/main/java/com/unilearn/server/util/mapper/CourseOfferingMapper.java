package com.unilearn.server.util.mapper;

import com.unilearn.server.dto.request.CourseOfferingRequest;
import com.unilearn.server.dto.response.CourseOfferingResponse;
import com.unilearn.server.dto.response.courseoffering.CourseOfferingListItemDTO;
import com.unilearn.server.exception.ValidationException;
import com.unilearn.server.model.Batch;
import com.unilearn.server.model.Course;
import com.unilearn.server.model.CourseOffering;
import com.unilearn.server.model.Lecturer;
import com.unilearn.server.model.Semester;
import org.springframework.stereotype.Component;

import java.util.Collections;

@Component
public class CourseOfferingMapper {

    public CourseOffering toCourseOffering(CourseOfferingRequest request, Course course, Batch batch, Semester semester, Lecturer lecturer) {
        if (request == null) {
            throw new ValidationException("Course offering request cannot be null");
        }
        return CourseOffering.builder()
                .course(course)
                .batch(batch)
                .semester(semester)
                .primaryLecturer(lecturer)
                .capacity(request.getCapacity())
                .build();
    }

    public CourseOfferingResponse toCourseOfferingResponse(CourseOffering offering) {
        if (offering == null) {
            throw new ValidationException("Course offering cannot be null");
        }
        String lecturerName = offering.getPrimaryLecturer() != null && offering.getPrimaryLecturer().getUser() != null ? offering.getPrimaryLecturer().getUser().getFullName() : null;
        Long lecturerId = offering.getPrimaryLecturer() != null ? offering.getPrimaryLecturer().getLecturerId() : null;
        String semesterName = offering.getSemester() != null ? offering.getSemester().getName() : null;

        return CourseOfferingResponse.builder()
                .offeringId(offering.getOfferingId())
                .courseId(offering.getCourse() != null ? offering.getCourse().getCourseId() : null)
                .courseName(offering.getCourse() != null ? offering.getCourse().getTitle() : null)
                .courseCode(offering.getCourse() != null ? offering.getCourse().getCode() : null)
                .batchId(offering.getBatch() != null ? offering.getBatch().getBatchId() : null)
                .batchName(offering.getBatch() != null ? offering.getBatch().getName() : null)
                .semesterId(offering.getSemester() != null ? offering.getSemester().getSemesterId() : null)
                .semesterLabel(semesterName)
                .semesterName(semesterName)
                .lecturerId(lecturerId)
                .lecturerName(lecturerName)
                .primaryLecturerId(lecturerId)
                .primaryLecturerName(lecturerName)
                .capacity(offering.getCapacity())
                .createdAt(offering.getCreatedAt())
                .enrollments(Collections.emptyList())
                .materials(Collections.emptyList())
                .assignments(Collections.emptyList())
                .exams(Collections.emptyList())
                .attendanceSessions(Collections.emptyList())
                .personalResources(Collections.emptyList())
                .build();
    }

    public CourseOfferingListItemDTO toCourseOfferingListItemDTO(CourseOffering offering, long enrollmentCount) {
        if (offering == null) {
            throw new ValidationException("Course offering cannot be null");
        }
        String lecturerName = offering.getPrimaryLecturer() != null && offering.getPrimaryLecturer().getUser() != null ? offering.getPrimaryLecturer().getUser().getFullName() : null;
        String semesterName = offering.getSemester() != null ? offering.getSemester().getName() : null;

        return CourseOfferingListItemDTO.builder()
                .offeringId(offering.getOfferingId())
                .courseCode(offering.getCourse() != null ? offering.getCourse().getCode() : null)
                .courseTitle(offering.getCourse() != null ? offering.getCourse().getTitle() : null)
                .batchName(offering.getBatch() != null ? offering.getBatch().getName() : null)
                .semesterName(semesterName)
                .lecturerName(lecturerName)
                .enrollmentCount(enrollmentCount)
                .build();
    }
}
