package com.unilearn.server.util.mapper;

import com.unilearn.server.dto.request.ExaminerRequest;
import com.unilearn.server.dto.response.ExaminerResponse;
import com.unilearn.server.exception.ValidationException;
import com.unilearn.server.model.Department;
import com.unilearn.server.model.Examiner;
import com.unilearn.server.model.User;
import org.springframework.stereotype.Component;

@Component
public class ExaminerMapper {

    public Examiner toExaminer(ExaminerRequest request, User user, Department department) {
        if (request == null) {
            throw new ValidationException("Examiner request cannot be null");
        }
        return Examiner.builder()
                .user(user)
                .department(department)
                .build();
    }

    public ExaminerResponse toExaminerResponse(Examiner examiner) {
        if (examiner == null) {
            throw new ValidationException("Examiner cannot be null");
        }
        return ExaminerResponse.builder()
                .examinerId(examiner.getExaminerId())
                .userId(examiner.getUser() != null ? examiner.getUser().getUserId() : null)
                .fullName(examiner.getUser() != null ? examiner.getUser().getFullName() : null)
                .email(examiner.getUser() != null ? examiner.getUser().getEmail() : null)
                .departmentId(examiner.getDepartment() != null ? examiner.getDepartment().getDepartmentId() : null)
                .departmentName(examiner.getDepartment() != null ? examiner.getDepartment().getName() : null)
                .build();
    }
}
