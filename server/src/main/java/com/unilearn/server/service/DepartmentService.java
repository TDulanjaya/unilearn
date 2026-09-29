package com.unilearn.server.service;

import com.unilearn.server.dto.request.DepartmentRequest;
import com.unilearn.server.dto.response.DepartmentResponse;
import com.unilearn.server.dto.response.PageResponseDTO;
import com.unilearn.server.dto.response.department.DepartmentOptionDTO;
import org.springframework.data.domain.Pageable;

import java.util.List;

// Departments service
public interface DepartmentService {

    DepartmentResponse createDepartment(DepartmentRequest request);

    DepartmentResponse updateDepartment(Long departmentId, DepartmentRequest request);

    void deleteDepartment(Long departmentId);

    DepartmentResponse getDepartmentById(Long departmentId);

    List<DepartmentResponse> getDepartmentsByFaculty(Long facultyId);

    PageResponseDTO<DepartmentResponse> getAllDepartments(Pageable pageable);

    List<DepartmentOptionDTO> getDepartmentOptions(Long facultyId, String searchText);
}
