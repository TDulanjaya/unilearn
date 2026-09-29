package com.unilearn.server.service;

import com.unilearn.server.dto.request.StudentRequest;
import com.unilearn.server.dto.response.PageResponseDTO;
import com.unilearn.server.dto.response.StudentResponse;
import com.unilearn.server.dto.response.student.StudentListItemDTO;
import com.unilearn.server.dto.response.student.StudentOptionDTO;
import org.springframework.data.domain.Pageable;

import java.util.List;

// Students service
public interface StudentService {

    StudentResponse createStudent(StudentRequest request);

    StudentResponse updateStudent(Long studentId, StudentRequest request);

    void deleteStudent(Long studentId);

    StudentResponse getStudentById(Long studentId);

    PageResponseDTO<StudentResponse> getStudentsByBatch(Long batchId, Pageable pageable);

    PageResponseDTO<StudentResponse> getStudentsByDepartment(Long departmentId, Pageable pageable);

    PageResponseDTO<StudentListItemDTO> getStudentListItemsByBatch(Long batchId, Pageable pageable);

    List<StudentOptionDTO> getStudentOptions(Long batchId, String searchText);
}
