package com.unilearn.server.service;

import com.unilearn.server.dto.request.ExamResultRequest;
import com.unilearn.server.dto.response.ExamResultResponse;

import java.util.List;

/**
 * Service interface for managing exam results.
 */
public interface ExamResultService {

    ExamResultResponse publishResult(ExamResultRequest request);

    ExamResultResponse publishResultForStudent(Long examId, Long studentId);

    List<ExamResultResponse> publishAllResultsForExam(Long examId);

    ExamResultResponse getResultForStudent(Long examId, Long studentId);

    List<ExamResultResponse> getResultsForExam(Long examId);
}
