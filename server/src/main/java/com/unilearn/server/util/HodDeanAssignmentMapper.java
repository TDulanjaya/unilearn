package com.unilearn.server.util;

import com.unilearn.server.dto.request.HodDeanAssignmentRequest;
import com.unilearn.server.dto.response.HodDeanAssignmentResponse;
import com.unilearn.server.exception.ValidationException;
import com.unilearn.server.model.Department;
import com.unilearn.server.model.Faculty;
import com.unilearn.server.model.HodDeanAssignment;
import com.unilearn.server.model.User;
import org.springframework.stereotype.Component;

@Component
public class HodDeanAssignmentMapper {

    public HodDeanAssignment toHodDeanAssignment(HodDeanAssignmentRequest request, User user, Faculty faculty, Department department) {
        if (request == null) {
            throw new ValidationException("HodDeanAssignment request cannot be null");
        }
        return HodDeanAssignment.builder()
                .user(user)
                .scopeType(request.getScopeType())
                .faculty(faculty)
                .department(department)
                .active(true)
                .build();
    }

    public HodDeanAssignmentResponse toHodDeanAssignmentResponse(HodDeanAssignment assignment) {
        if (assignment == null) {
            throw new ValidationException("HodDeanAssignment cannot be null");
        }
        return HodDeanAssignmentResponse.builder()
                .assignmentId(assignment.getAssignmentId())
                .userId(assignment.getUser() != null ? assignment.getUser().getUserId() : null)
                .userName(assignment.getUser() != null ? assignment.getUser().getFullName() : null)
                .scopeType(assignment.getScopeType())
                .facultyId(assignment.getFaculty() != null ? assignment.getFaculty().getFacultyId() : null)
                .facultyName(assignment.getFaculty() != null ? assignment.getFaculty().getName() : null)
                .departmentId(assignment.getDepartment() != null ? assignment.getDepartment().getDepartmentId() : null)
                .departmentName(assignment.getDepartment() != null ? assignment.getDepartment().getName() : null)
                .active(assignment.getActive())
                .endDate(assignment.getEndDate())
                .build();
    }
}
