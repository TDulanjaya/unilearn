package com.unilearn.server.service;

import com.unilearn.server.dto.request.submission.SubmissionCreateRequestDTO;
import com.unilearn.server.dto.request.submission.SubmissionGradeRequestDTO;
import com.unilearn.server.dto.response.SubmissionResponse;

import java.util.List;

// Assignment submissions service
public interface SubmissionService {

    SubmissionResponse submitAssignment(SubmissionCreateRequestDTO request);

    SubmissionResponse gradeSubmission(Long submissionId, SubmissionGradeRequestDTO gradeRequest);

    List<SubmissionResponse> getSubmissionsByAssignment(Long assignmentId);

    List<SubmissionResponse> getSubmissionsByStudent(Long studentId);
}
