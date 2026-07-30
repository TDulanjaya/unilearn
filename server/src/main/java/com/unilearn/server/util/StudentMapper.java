package com.unilearn.server.util;

import com.unilearn.server.dto.request.StudentRequest;
import com.unilearn.server.dto.response.StudentResponse;
import com.unilearn.server.exception.ValidationException;
import com.unilearn.server.model.Batch;
import com.unilearn.server.model.Department;
import com.unilearn.server.model.Student;
import com.unilearn.server.model.User;
import org.springframework.stereotype.Component;

import java.util.Collections;

@Component
public class StudentMapper {

    public Student toStudent(StudentRequest request, User user, Department department, Batch batch) {
        if (request == null) {
            throw new ValidationException("Student request cannot be null");
        }
        return Student.builder()
                .user(user)
                .studentNo(request.getStudentNo())
                .department(department)
                .batch(batch)
                .enrollmentYear(request.getEnrollmentYear())
                .feeStatus("pending")
                .build();
    }

    public StudentResponse toStudentResponse(Student student) {
        if (student == null) {
            throw new ValidationException("Student cannot be null");
        }
        return StudentResponse.builder()
                .studentId(student.getStudentId())
                .userId(student.getUser() != null ? student.getUser().getUserId() : null)
                .fullName(student.getUser() != null ? student.getUser().getFullName() : null)
                .email(student.getUser() != null ? student.getUser().getEmail() : null)
                .studentNo(student.getStudentNo())
                .departmentId(student.getDepartment() != null ? student.getDepartment().getDepartmentId() : null)
                .departmentName(student.getDepartment() != null ? student.getDepartment().getName() : null)
                .batchId(student.getBatch() != null ? student.getBatch().getBatchId() : null)
                .batchName(student.getBatch() != null ? student.getBatch().getName() : null)
                .enrollments(Collections.emptyList())
                .submissions(Collections.emptyList())
                .examAttempts(Collections.emptyList())
                .personalResources(Collections.emptyList())
                .attendanceRecords(Collections.emptyList())
                .build();
    }
}
