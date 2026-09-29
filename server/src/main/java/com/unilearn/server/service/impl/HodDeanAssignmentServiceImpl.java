package com.unilearn.server.service.impl;

import com.unilearn.server.dto.request.hoddeanassignment.HodDeanAssignRequestDTO;
import com.unilearn.server.dto.request.hoddeanassignment.HodDeanRevokeRequestDTO;
import com.unilearn.server.dto.response.HodDeanAssignmentResponse;
import com.unilearn.server.exception.EntryNotFoundException;
import com.unilearn.server.exception.ValidationException;
import com.unilearn.server.model.Department;
import com.unilearn.server.model.Faculty;
import com.unilearn.server.model.HodDeanAssignment;
import com.unilearn.server.model.User;
import com.unilearn.server.repository.DepartmentRepository;
import com.unilearn.server.repository.FacultyRepository;
import com.unilearn.server.repository.HodDeanAssignmentRepository;
import com.unilearn.server.repository.UserRepository;
import com.unilearn.server.service.HodDeanAssignmentService;
import com.unilearn.server.util.mapper.HodDeanAssignmentMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class HodDeanAssignmentServiceImpl implements HodDeanAssignmentService {

    private final HodDeanAssignmentRepository hodDeanAssignmentRepository;
    private final UserRepository userRepository;
    private final FacultyRepository facultyRepository;
    private final DepartmentRepository departmentRepository;
    private final HodDeanAssignmentMapper hodDeanAssignmentMapper;

    @Override
    @Transactional
    public HodDeanAssignmentResponse assignHodOrDean(HodDeanAssignRequestDTO request) {
        if (request == null) {
            throw new ValidationException("HodDeanAssignment request cannot be null");
        }

        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new EntryNotFoundException("User not found with ID: " + request.getUserId()));

        Faculty faculty = null;
        Department department = null;

        if ("department".equalsIgnoreCase(request.getScopeType())) {
            if (request.getDepartmentId() == null) {
                throw new ValidationException("Department ID is required for department scope assignment");
            }
            department = departmentRepository.findById(request.getDepartmentId())
                    .orElseThrow(() -> new EntryNotFoundException("Department not found with ID: " + request.getDepartmentId()));

            boolean hasActive = hodDeanAssignmentRepository.findByDepartment_DepartmentIdAndActiveTrue(request.getDepartmentId()).isPresent();
            if (hasActive) {
                throw new com.unilearn.server.exception.DuplicateEntryException("Department already has an active HOD");
            }
        } else if ("faculty".equalsIgnoreCase(request.getScopeType())) {
            if (request.getFacultyId() == null) {
                throw new ValidationException("Faculty ID is required for faculty scope assignment");
            }
            faculty = facultyRepository.findById(request.getFacultyId())
                    .orElseThrow(() -> new EntryNotFoundException("Faculty not found with ID: " + request.getFacultyId()));

            boolean hasActive = hodDeanAssignmentRepository.findByFaculty_FacultyIdAndActiveTrue(request.getFacultyId()).isPresent();
            if (hasActive) {
                throw new com.unilearn.server.exception.DuplicateEntryException("Faculty already has an active Dean");
            }
        }

        HodDeanAssignment assignment = hodDeanAssignmentMapper.toHodDeanAssignment(request, user, faculty, department);
        HodDeanAssignment saved = hodDeanAssignmentRepository.save(assignment);

        // Update user role
        user.setRole("hod_dean");
        userRepository.save(user);

        return hodDeanAssignmentMapper.toHodDeanAssignmentResponse(saved);
    }

    @Override
    @Transactional
    public HodDeanAssignmentResponse revokeAssignment(Long assignmentId, HodDeanRevokeRequestDTO revokeRequest) {
        if (assignmentId == null) {
            throw new ValidationException("Assignment ID cannot be null");
        }

        HodDeanAssignment assignment = hodDeanAssignmentRepository.findById(assignmentId)
                .orElseThrow(() -> new EntryNotFoundException("HodDeanAssignment not found with ID: " + assignmentId));

        assignment.setActive(false);
        LocalDate endDate = (revokeRequest != null && revokeRequest.getEndDate() != null) ? revokeRequest.getEndDate() : LocalDate.now();
        assignment.setEndDate(endDate);

        HodDeanAssignment updated = hodDeanAssignmentRepository.save(assignment);

        // Revert user role to previous role or lecturer
        User user = assignment.getUser();
        if (user != null) {
            String restoreTo = assignment.getPreviousRole() != null ? assignment.getPreviousRole() : "lecturer";
            user.setRole(restoreTo);
            userRepository.save(user);
        }

        return hodDeanAssignmentMapper.toHodDeanAssignmentResponse(updated);
    }

    @Override
    public List<HodDeanAssignmentResponse> getAssignmentsByUser(Long userId) {
        if (userId == null) {
            throw new ValidationException("User ID cannot be null");
        }
        if (!userRepository.existsById(userId)) {
            throw new EntryNotFoundException("User not found with ID: " + userId);
        }

        return hodDeanAssignmentRepository.findByUser_UserId(userId)
                .stream()
                .map(hodDeanAssignmentMapper::toHodDeanAssignmentResponse)
                .toList();
    }

    @Override
    public HodDeanAssignmentResponse getActiveHodForDepartment(Long departmentId) {
        if (departmentId == null) {
            throw new ValidationException("Department ID cannot be null");
        }
        HodDeanAssignment assignment = hodDeanAssignmentRepository.findByDepartment_DepartmentIdAndActiveTrue(departmentId)
                .orElseThrow(() -> new EntryNotFoundException("Active HOD assignment not found for Department ID: " + departmentId));
        return hodDeanAssignmentMapper.toHodDeanAssignmentResponse(assignment);
    }

    @Override
    public HodDeanAssignmentResponse getActiveDeanForFaculty(Long facultyId) {
        if (facultyId == null) {
            throw new ValidationException("Faculty ID cannot be null");
        }
        HodDeanAssignment assignment = hodDeanAssignmentRepository.findByFaculty_FacultyIdAndActiveTrue(facultyId)
                .orElseThrow(() -> new EntryNotFoundException("Active Dean assignment not found for Faculty ID: " + facultyId));
        return hodDeanAssignmentMapper.toHodDeanAssignmentResponse(assignment);
    }
}
