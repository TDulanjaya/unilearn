package com.unilearn.server.service;

import com.unilearn.server.dto.request.SubmissionRequest;
import com.unilearn.server.dto.response.SubmissionResponse;

import java.math.BigDecimal;
import java.util.List;

/**
 * Service interface for managing assignment submissions.
 */
public interface SubmissionService {

    SubmissionResponse submitAssignment(SubmissionRequest request);

    SubmissionResponse gradeSubmission(Long submissionId, BigDecimal score, String feedback, Long gradedByLecturerId);

    List<SubmissionResponse> getSubmissionsByAssignment(Long assignmentId);

    List<SubmissionResponse> getSubmissionsByStudent(Long studentId);
}
