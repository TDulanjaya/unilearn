package com.unilearn.server.service;

import com.unilearn.server.dto.request.HodDeanAssignmentRequest;
import com.unilearn.server.dto.response.HodDeanAssignmentResponse;

import java.time.LocalDate;
import java.util.List;

/**
 * Service interface for managing HOD and Dean assignments.
 */
public interface HodDeanAssignmentService {

    HodDeanAssignmentResponse assignHodOrDean(HodDeanAssignmentRequest request);

    HodDeanAssignmentResponse revokeAssignment(Long assignmentId, LocalDate endDate);

    List<HodDeanAssignmentResponse> getAssignmentsByUser(Long userId);

    HodDeanAssignmentResponse getActiveHodForDepartment(Long departmentId);

    HodDeanAssignmentResponse getActiveDeanForFaculty(Long facultyId);
}
