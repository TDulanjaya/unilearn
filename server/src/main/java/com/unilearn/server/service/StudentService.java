package com.unilearn.server.service;

import com.unilearn.server.dto.request.StudentRequest;
import com.unilearn.server.dto.response.PageResponseDTO;
import com.unilearn.server.dto.response.StudentResponse;
import org.springframework.data.domain.Pageable;

/**
 * Service interface for managing students.
 */
public interface StudentService {

    StudentResponse createStudent(StudentRequest request);

    StudentResponse updateStudent(Long studentId, StudentRequest request);

    void deleteStudent(Long studentId);

    StudentResponse getStudentById(Long studentId);

    PageResponseDTO<StudentResponse> getStudentsByBatch(Long batchId, Pageable pageable);

    PageResponseDTO<StudentResponse> getStudentsByDepartment(Long departmentId, Pageable pageable);
}
