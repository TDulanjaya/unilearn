package com.unilearn.server.service.impl;

import com.unilearn.server.dto.request.StaffAdminRequest;
import com.unilearn.server.dto.response.PageResponseDTO;
import com.unilearn.server.dto.response.StaffAdminResponse;
import com.unilearn.server.exception.EntryNotFoundException;
import com.unilearn.server.exception.ValidationException;
import com.unilearn.server.model.Department;
import com.unilearn.server.model.Faculty;
import com.unilearn.server.model.StaffAdmin;
import com.unilearn.server.model.User;
import com.unilearn.server.repository.DepartmentRepository;
import com.unilearn.server.repository.FacultyRepository;
import com.unilearn.server.repository.StaffAdminRepository;
import com.unilearn.server.repository.UserRepository;
import com.unilearn.server.service.StaffAdminService;
import com.unilearn.server.util.StaffAdminMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class StaffAdminServiceImpl implements StaffAdminService {

    private final StaffAdminRepository staffAdminRepository;
    private final UserRepository userRepository;
    private final FacultyRepository facultyRepository;
    private final DepartmentRepository departmentRepository;
    private final StaffAdminMapper staffAdminMapper;

    @Override
    @Transactional
    public StaffAdminResponse createStaffAdmin(StaffAdminRequest request) {
        if (request == null) {
            throw new ValidationException("StaffAdmin request cannot be null");
        }

        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new EntryNotFoundException("User not found with ID: " + request.getUserId()));

        Faculty faculty = null;
        if (request.getFacultyId() != null) {
            faculty = facultyRepository.findById(request.getFacultyId())
                    .orElseThrow(() -> new EntryNotFoundException("Faculty not found with ID: " + request.getFacultyId()));
        }

        Department department = null;
        if (request.getDepartmentId() != null) {
            department = departmentRepository.findById(request.getDepartmentId())
                    .orElseThrow(() -> new EntryNotFoundException("Department not found with ID: " + request.getDepartmentId()));
        }

        StaffAdmin staffAdmin = staffAdminMapper.toStaffAdmin(request, user, faculty, department);
        StaffAdmin saved = staffAdminRepository.save(staffAdmin);
        return staffAdminMapper.toStaffAdminResponse(saved);
    }

    @Override
    @Transactional
    public StaffAdminResponse updateStaffAdmin(Long staffId, StaffAdminRequest request) {
        if (staffId == null) {
            throw new ValidationException("Staff ID cannot be null");
        }
        if (request == null) {
            throw new ValidationException("StaffAdmin request cannot be null");
        }

        StaffAdmin staffAdmin = staffAdminRepository.findById(staffId)
                .orElseThrow(() -> new EntryNotFoundException("StaffAdmin not found with ID: " + staffId));

        Faculty faculty = null;
        if (request.getFacultyId() != null) {
            faculty = facultyRepository.findById(request.getFacultyId())
                    .orElseThrow(() -> new EntryNotFoundException("Faculty not found with ID: " + request.getFacultyId()));
        }

        Department department = null;
        if (request.getDepartmentId() != null) {
            department = departmentRepository.findById(request.getDepartmentId())
                    .orElseThrow(() -> new EntryNotFoundException("Department not found with ID: " + request.getDepartmentId()));
        }

        staffAdmin.setScopeLevel(request.getScopeLevel());
        staffAdmin.setFaculty(faculty);
        staffAdmin.setDepartment(department);

        StaffAdmin updated = staffAdminRepository.save(staffAdmin);
        return staffAdminMapper.toStaffAdminResponse(updated);
    }

    @Override
    @Transactional
    public void deleteStaffAdmin(Long staffId) {
        if (staffId == null) {
            throw new ValidationException("Staff ID cannot be null");
        }
        if (!staffAdminRepository.existsById(staffId)) {
            throw new EntryNotFoundException("StaffAdmin not found with ID: " + staffId);
        }
        staffAdminRepository.deleteById(staffId);
    }

    @Override
    public StaffAdminResponse getStaffAdminById(Long staffId) {
        if (staffId == null) {
            throw new ValidationException("Staff ID cannot be null");
        }
        StaffAdmin staffAdmin = staffAdminRepository.findById(staffId)
                .orElseThrow(() -> new EntryNotFoundException("StaffAdmin not found with ID: " + staffId));
        return staffAdminMapper.toStaffAdminResponse(staffAdmin);
    }

    @Override
    public PageResponseDTO<StaffAdminResponse> getAllStaffAdmins(Pageable pageable) {
        if (pageable == null) {
            throw new ValidationException("Pageable parameter cannot be null");
        }
        Page<StaffAdmin> page = staffAdminRepository.findAll(pageable);
        List<StaffAdminResponse> content = page.getContent()
                .stream()
                .map(staffAdminMapper::toStaffAdminResponse)
                .toList();

        return PageResponseDTO.<StaffAdminResponse>builder()
                .dataCount((int) page.getTotalElements())
                .dataList(content)
                .build();
    }

    @Override
    public boolean canManageScope(Long staffId, String requiredScopeLevel) {
        if (staffId == null || requiredScopeLevel == null) {
            return false;
        }
        StaffAdmin staffAdmin = staffAdminRepository.findById(staffId).orElse(null);
        if (staffAdmin == null) {
            return false;
        }
        if ("institution".equalsIgnoreCase(staffAdmin.getScopeLevel())) {
            return true;
        }
        return staffAdmin.getScopeLevel().equalsIgnoreCase(requiredScopeLevel);
    }
}
