package com.unilearn.server.service.impl;

import com.unilearn.server.dto.request.DepartmentRequest;
import com.unilearn.server.dto.response.DepartmentResponse;
import com.unilearn.server.dto.response.PageResponseDTO;
import com.unilearn.server.exception.EntryNotFoundException;
import com.unilearn.server.exception.ValidationException;
import com.unilearn.server.model.Department;
import com.unilearn.server.model.Faculty;
import com.unilearn.server.model.User;
import com.unilearn.server.repository.DepartmentRepository;
import com.unilearn.server.repository.FacultyRepository;
import com.unilearn.server.repository.UserRepository;
import com.unilearn.server.service.DepartmentService;
import com.unilearn.server.util.mapper.DepartmentMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class DepartmentServiceImpl implements DepartmentService {

    private final DepartmentRepository departmentRepository;
    private final FacultyRepository facultyRepository;
    private final UserRepository userRepository;
    private final DepartmentMapper departmentMapper;

    @Override
    @Transactional
    public DepartmentResponse createDepartment(DepartmentRequest request) {
        if (request == null) {
            throw new ValidationException("Department request cannot be null");
        }

        if (departmentRepository.existsByCode(request.getCode())) {
            throw new com.unilearn.server.exception.DuplicateEntryException("Department code already exists: " + request.getCode());
        }

        Faculty faculty = facultyRepository.findById(request.getFacultyId())
                .orElseThrow(() -> new EntryNotFoundException("Faculty not found with ID: " + request.getFacultyId()));

        User hod = null;
        if (request.getHodUserId() != null) {
            hod = userRepository.findById(request.getHodUserId())
                    .orElseThrow(() -> new EntryNotFoundException("User not found with ID: " + request.getHodUserId()));
        }

        Department department = departmentMapper.toDepartment(request, faculty, hod);
        Department savedDepartment = departmentRepository.save(department);
        return departmentMapper.toDepartmentResponse(savedDepartment);
    }

    @Override
    @Transactional
    public DepartmentResponse updateDepartment(Long departmentId, DepartmentRequest request) {
        if (departmentId == null) {
            throw new ValidationException("Department ID cannot be null");
        }
        if (request == null) {
            throw new ValidationException("Department request cannot be null");
        }

        Department department = departmentRepository.findById(departmentId)
                .orElseThrow(() -> new EntryNotFoundException("Department not found with ID: " + departmentId));

        if (!department.getCode().equalsIgnoreCase(request.getCode())
                && departmentRepository.existsByCode(request.getCode())) {
            throw new com.unilearn.server.exception.DuplicateEntryException("Department code already exists: " + request.getCode());
        }

        Faculty faculty = facultyRepository.findById(request.getFacultyId())
                .orElseThrow(() -> new EntryNotFoundException("Faculty not found with ID: " + request.getFacultyId()));

        User hod = null;
        if (request.getHodUserId() != null) {
            hod = userRepository.findById(request.getHodUserId())
                    .orElseThrow(() -> new EntryNotFoundException("User not found with ID: " + request.getHodUserId()));
        }

        department.setName(request.getName());
        department.setCode(request.getCode());
        department.setFaculty(faculty);
        department.setHod(hod);

        Department updatedDepartment = departmentRepository.save(department);
        return departmentMapper.toDepartmentResponse(updatedDepartment);
    }

    @Override
    @Transactional
    public void deleteDepartment(Long departmentId) {
        if (departmentId == null) {
            throw new ValidationException("Department ID cannot be null");
        }

        if (!departmentRepository.existsById(departmentId)) {
            throw new EntryNotFoundException("Department not found with ID: " + departmentId);
        }

        departmentRepository.deleteById(departmentId);
    }

    @Override
    public DepartmentResponse getDepartmentById(Long departmentId) {
        if (departmentId == null) {
            throw new ValidationException("Department ID cannot be null");
        }

        Department department = departmentRepository.findById(departmentId)
                .orElseThrow(() -> new EntryNotFoundException("Department not found with ID: " + departmentId));
        return departmentMapper.toDepartmentResponse(department);
    }

    @Override
    public List<DepartmentResponse> getDepartmentsByFaculty(Long facultyId) {
        if (facultyId == null) {
            throw new ValidationException("Faculty ID cannot be null");
        }

        if (!facultyRepository.existsById(facultyId)) {
            throw new EntryNotFoundException("Faculty not found with ID: " + facultyId);
        }

        return departmentRepository.findByFaculty_FacultyId(facultyId)
                .stream()
                .map(departmentMapper::toDepartmentResponse)
                .toList();
    }

    @Override
    public PageResponseDTO<DepartmentResponse> getAllDepartments(Pageable pageable) {
        if (pageable == null) {
            throw new ValidationException("Pageable parameter cannot be null");
        }

        Page<Department> page = departmentRepository.findAll(pageable);
        List<DepartmentResponse> content = page.getContent()
                .stream()
                .map(departmentMapper::toDepartmentResponse)
                .toList();

        return PageResponseDTO.<DepartmentResponse>builder()
                .dataCount((int) page.getTotalElements())
                .dataList(content)
                .build();
    }

    @Override
    public List<com.unilearn.server.dto.response.department.DepartmentOptionDTO> getDepartmentOptions(Long facultyId, String searchText) {
        String filter = (searchText == null) ? "" : searchText.trim().toLowerCase();
        List<Department> departments = (facultyId != null) 
                ? departmentRepository.findByFaculty_FacultyId(facultyId) 
                : departmentRepository.findAll();

        return departments.stream()
                .filter(d -> filter.isEmpty() || d.getName().toLowerCase().contains(filter) || d.getCode().toLowerCase().contains(filter))
                .map(departmentMapper::toDepartmentOptionDTO)
                .toList();
    }
}
