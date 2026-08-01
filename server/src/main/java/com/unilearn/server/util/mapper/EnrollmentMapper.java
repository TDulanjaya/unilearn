package com.unilearn.server.util.mapper;

import com.unilearn.server.dto.request.enrollment.EnrollmentCreateRequestDTO;
import com.unilearn.server.dto.response.EnrollmentResponse;
import com.unilearn.server.exception.ValidationException;
import com.unilearn.server.model.CourseOffering;
import com.unilearn.server.model.Enrollment;
import com.unilearn.server.model.Student;
import org.springframework.stereotype.Component;

import java.time.LocalDate;

@Component
public class EnrollmentMapper {

    public Enrollment toEnrollment(EnrollmentCreateRequestDTO request, Student student, CourseOffering offering) {
        if (request == null) {
            throw new ValidationException("Enrollment request cannot be null");
        }
        return Enrollment.builder()
                .student(student)
                .courseOffering(offering)
                .enrollmentDate(LocalDate.now())
                .status("active")
                .build();
    }

    public EnrollmentResponse toEnrollmentResponse(Enrollment enrollment) {
        if (enrollment == null) {
            throw new ValidationException("Enrollment cannot be null");
        }
        return EnrollmentResponse.builder()
                .enrollmentId(enrollment.getEnrollmentId())
                .studentId(enrollment.getStudent() != null ? enrollment.getStudent().getStudentId() : null)
                .studentName(enrollment.getStudent() != null && enrollment.getStudent().getUser() != null ? enrollment.getStudent().getUser().getFullName() : null)
                .offeringId(enrollment.getCourseOffering() != null ? enrollment.getCourseOffering().getOfferingId() : null)
                .courseCode(enrollment.getCourseOffering() != null && enrollment.getCourseOffering().getCourse() != null ? enrollment.getCourseOffering().getCourse().getCode() : null)
                .courseName(enrollment.getCourseOffering() != null && enrollment.getCourseOffering().getCourse() != null ? enrollment.getCourseOffering().getCourse().getTitle() : null)
                .batchId(enrollment.getCourseOffering() != null && enrollment.getCourseOffering().getBatch() != null ? enrollment.getCourseOffering().getBatch().getBatchId() : null)
                .batchName(enrollment.getCourseOffering() != null && enrollment.getCourseOffering().getBatch() != null ? enrollment.getCourseOffering().getBatch().getName() : null)
                .enrolledAt(enrollment.getEnrollmentDate())
                .enrollmentDate(enrollment.getEnrollmentDate())
                .status(enrollment.getStatus())
                .build();
    }
}
