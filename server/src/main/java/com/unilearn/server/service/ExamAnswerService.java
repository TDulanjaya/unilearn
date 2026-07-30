package com.unilearn.server.service;

import com.unilearn.server.dto.request.ExamAnswerRequest;
import com.unilearn.server.dto.response.ExamAnswerResponse;

import java.math.BigDecimal;
import java.util.List;

/**
 * Service interface for managing exam answers.
 */
public interface ExamAnswerService {

    ExamAnswerResponse saveAnswer(ExamAnswerRequest request);

    List<ExamAnswerResponse> getAnswersForAttempt(Long attemptId);

    ExamAnswerResponse gradeAnswer(Long attemptId, Long questionId, BigDecimal marksAwarded);
}
