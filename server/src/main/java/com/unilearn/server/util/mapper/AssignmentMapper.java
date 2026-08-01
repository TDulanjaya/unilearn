package com.unilearn.server.util.mapper;

import com.unilearn.server.dto.request.AssignmentRequest;
import com.unilearn.server.dto.response.AssignmentResponse;
import com.unilearn.server.exception.ValidationException;
import com.unilearn.server.model.Assignment;
import com.unilearn.server.model.CourseOffering;
import com.unilearn.server.model.Lecturer;
import org.springframework.stereotype.Component;

import java.util.Collections;

@Component
public class AssignmentMapper {

    public Assignment toAssignment(AssignmentRequest request, CourseOffering offering, Lecturer lecturer) {
        if (request == null) {
            throw new ValidationException("Assignment request cannot be null");
        }
        return Assignment.builder()
                .courseOffering(offering)
                .title(request.getTitle())
                .description(request.getDescription())
                .deadline(request.getDeadline())
                .maxScore(request.getMaxScore())
                .allowResubmission(request.getAllowResubmission() != null ? request.getAllowResubmission() : false)
                .createdBy(lecturer)
                .build();
    }

    public AssignmentResponse toAssignmentResponse(Assignment assignment) {
        if (assignment == null) {
            throw new ValidationException("Assignment cannot be null");
        }
        return AssignmentResponse.builder()
                .assignmentId(assignment.getAssignmentId())
                .offeringId(assignment.getCourseOffering() != null ? assignment.getCourseOffering().getOfferingId() : null)
                .title(assignment.getTitle())
                .description(assignment.getDescription())
                .deadline(assignment.getDeadline())
                .maxScore(assignment.getMaxScore())
                .allowResubmission(assignment.getAllowResubmission())
                .resubmissionAllowed(assignment.getAllowResubmission())
                .createdById(assignment.getCreatedBy() != null ? assignment.getCreatedBy().getLecturerId() : null)
                .createdByName(assignment.getCreatedBy() != null && assignment.getCreatedBy().getUser() != null ? assignment.getCreatedBy().getUser().getFullName() : null)
                .createdAt(assignment.getCreatedAt())
                .submissions(Collections.emptyList())
                .build();
    }
}
