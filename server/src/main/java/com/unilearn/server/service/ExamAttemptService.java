package com.unilearn.server.service;

import com.unilearn.server.dto.request.examattempt.ExamAttemptStartRequestDTO;
import com.unilearn.server.dto.response.ExamAttemptResponse;

import java.util.List;

// Exam attempts service
public interface ExamAttemptService {

    ExamAttemptResponse startAttempt(ExamAttemptStartRequestDTO request);

    ExamAttemptResponse submitAttempt(Long attemptId, Long studentId);

    ExamAttemptResponse getAttemptById(Long attemptId);

    List<ExamAttemptResponse> getAttemptsByExam(Long examId);

    List<ExamAttemptResponse> getAttemptsByStudent(Long studentId);
}
