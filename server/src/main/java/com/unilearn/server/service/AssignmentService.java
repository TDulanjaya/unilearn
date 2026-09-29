package com.unilearn.server.service;

import com.unilearn.server.dto.request.AssignmentRequest;
import com.unilearn.server.dto.response.AssignmentResponse;

import java.util.List;

// Assignments service
public interface AssignmentService {

    AssignmentResponse createAssignment(AssignmentRequest request);

    AssignmentResponse updateAssignment(Long assignmentId, AssignmentRequest request);

    void deleteAssignment(Long assignmentId);

    AssignmentResponse getAssignmentById(Long assignmentId);

    List<AssignmentResponse> getAssignmentsByOffering(Long offeringId);
}
