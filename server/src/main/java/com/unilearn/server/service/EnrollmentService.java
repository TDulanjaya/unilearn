package com.unilearn.server.service;

import com.unilearn.server.dto.request.enrollment.EnrollmentCreateRequestDTO;
import com.unilearn.server.dto.response.EnrollmentResponse;
import com.unilearn.server.dto.response.PageResponseDTO;
import org.springframework.data.domain.Pageable;

import java.util.List;

// Service interface for managing course enrollments
public interface EnrollmentService {

    EnrollmentResponse enrollStudent(EnrollmentCreateRequestDTO request);

    void dropEnrollment(Long enrollmentId, Long currentUserId);

    List<EnrollmentResponse> getEnrollmentsByStudent(Long studentId);

    PageResponseDTO<EnrollmentResponse> getEnrollmentsByOffering(Long offeringId, Pageable pageable);

    EnrollmentResponse updateStatus(Long enrollmentId, String status);

    // Legacy single offering batch enroll
    java.util.Map<String, Object> enrollBatch(Long batchId, Long offeringId);

    // Enroll a batch into multiple offerings in one go
    java.util.Map<String, Object> enrollBatchMultiple(Long batchId, List<Long> offeringIds);
}
