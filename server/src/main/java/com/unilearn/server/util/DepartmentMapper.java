package com.unilearn.server.util;

import com.unilearn.server.dto.request.DepartmentRequest;
import com.unilearn.server.dto.response.DepartmentResponse;
import com.unilearn.server.exception.ValidationException;
import com.unilearn.server.model.Department;
import com.unilearn.server.model.Faculty;
import com.unilearn.server.model.User;
import org.springframework.stereotype.Component;

import java.util.Collections;

@Component
public class DepartmentMapper {

    public Department toDepartment(DepartmentRequest request, Faculty faculty, User hod) {
        if (request == null) {
            throw new ValidationException("Department request cannot be null");
        }
        return Department.builder()
                .name(request.getName())
                .code(request.getCode())
                .faculty(faculty)
                .hod(hod)
                .build();
    }

    public DepartmentResponse toDepartmentResponse(Department department) {
        if (department == null) {
            throw new ValidationException("Department cannot be null");
        }
        return DepartmentResponse.builder()
                .departmentId(department.getDepartmentId())
                .name(department.getName())
                .code(department.getCode())
                .facultyId(department.getFaculty() != null ? department.getFaculty().getFacultyId() : null)
                .facultyName(department.getFaculty() != null ? department.getFaculty().getName() : null)
                .hodUserId(department.getHod() != null ? department.getHod().getUserId() : null)
                .hodUserName(department.getHod() != null ? department.getHod().getFullName() : null)
                .createdAt(department.getCreatedAt())
                .courses(Collections.emptyList())
                .students(Collections.emptyList())
                .lecturers(Collections.emptyList())
                .batches(Collections.emptyList())
                .build();
    }
}
