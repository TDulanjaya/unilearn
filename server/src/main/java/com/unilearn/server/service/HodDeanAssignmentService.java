package com.unilearn.server.service;

import com.unilearn.server.dto.request.hoddeanassignment.HodDeanAssignRequestDTO;
import com.unilearn.server.dto.request.hoddeanassignment.HodDeanRevokeRequestDTO;
import com.unilearn.server.dto.response.HodDeanAssignmentResponse;

import java.util.List;

/**
 * Service interface for managing HOD and Dean assignments.
 */
public interface HodDeanAssignmentService {

    HodDeanAssignmentResponse assignHodOrDean(HodDeanAssignRequestDTO request);

    HodDeanAssignmentResponse revokeAssignment(Long assignmentId, HodDeanRevokeRequestDTO revokeRequest);

    List<HodDeanAssignmentResponse> getAssignmentsByUser(Long userId);

    HodDeanAssignmentResponse getActiveHodForDepartment(Long departmentId);

    HodDeanAssignmentResponse getActiveDeanForFaculty(Long facultyId);
}
