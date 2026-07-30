package com.unilearn.server.service;

import com.unilearn.server.dto.request.DepartmentRequest;
import com.unilearn.server.dto.response.DepartmentResponse;
import com.unilearn.server.dto.response.PageResponseDTO;
import org.springframework.data.domain.Pageable;

import java.util.List;

/**
 * Service interface for managing departments within the UniLearn platform.
 */
public interface DepartmentService {

    DepartmentResponse createDepartment(DepartmentRequest request);

    DepartmentResponse updateDepartment(Long departmentId, DepartmentRequest request);

    void deleteDepartment(Long departmentId);

    DepartmentResponse getDepartmentById(Long departmentId);

    List<DepartmentResponse> getDepartmentsByFaculty(Long facultyId);

    PageResponseDTO<DepartmentResponse> getAllDepartments(Pageable pageable);
}
