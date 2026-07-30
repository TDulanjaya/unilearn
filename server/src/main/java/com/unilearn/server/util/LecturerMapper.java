package com.unilearn.server.util;

import com.unilearn.server.dto.request.LecturerRequest;
import com.unilearn.server.dto.response.LecturerResponse;
import com.unilearn.server.exception.ValidationException;
import com.unilearn.server.model.Department;
import com.unilearn.server.model.Lecturer;
import com.unilearn.server.model.User;
import org.springframework.stereotype.Component;

@Component
public class LecturerMapper {

    public Lecturer toLecturer(LecturerRequest request, User user, Department department) {
        if (request == null) {
            throw new ValidationException("Lecturer request cannot be null");
        }
        return Lecturer.builder()
                .user(user)
                .department(department)
                .designation(request.getDesignation())
                .isGuest(request.getIsGuest() != null ? request.getIsGuest() : false)
                .contractEndDate(request.getContractEndDate())
                .build();
    }

    public LecturerResponse toLecturerResponse(Lecturer lecturer) {
        if (lecturer == null) {
            throw new ValidationException("Lecturer cannot be null");
        }
        return LecturerResponse.builder()
                .lecturerId(lecturer.getLecturerId())
                .userId(lecturer.getUser() != null ? lecturer.getUser().getUserId() : null)
                .fullName(lecturer.getUser() != null ? lecturer.getUser().getFullName() : null)
                .email(lecturer.getUser() != null ? lecturer.getUser().getEmail() : null)
                .departmentId(lecturer.getDepartment() != null ? lecturer.getDepartment().getDepartmentId() : null)
                .departmentName(lecturer.getDepartment() != null ? lecturer.getDepartment().getName() : null)
                .designation(lecturer.getDesignation())
                .isGuest(lecturer.getIsGuest())
                .contractEndDate(lecturer.getContractEndDate())
                .build();
    }
}
