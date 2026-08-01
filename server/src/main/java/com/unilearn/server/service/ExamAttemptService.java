package com.unilearn.server.service;

import com.unilearn.server.dto.request.examattempt.ExamAttemptStartRequestDTO;
import com.unilearn.server.dto.response.ExamAttemptResponse;

import java.util.List;

/**
 * Service interface for managing exam attempts.
 */
public interface ExamAttemptService {

    ExamAttemptResponse startAttempt(ExamAttemptStartRequestDTO request);

    ExamAttemptResponse submitAttempt(Long attemptId);

    ExamAttemptResponse getAttemptById(Long attemptId);

    List<ExamAttemptResponse> getAttemptsByExam(Long examId);

    List<ExamAttemptResponse> getAttemptsByStudent(Long studentId);
}
