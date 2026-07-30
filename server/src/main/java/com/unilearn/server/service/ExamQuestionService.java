package com.unilearn.server.service;

import com.unilearn.server.dto.request.ExamQuestionRequest;
import com.unilearn.server.dto.response.ExamQuestionResponse;

import java.util.List;

/**
 * Service interface for managing exam questions.
 */
public interface ExamQuestionService {

    ExamQuestionResponse addQuestionToExam(ExamQuestionRequest request);

    void removeQuestionFromExam(Long examId, Long questionId);

    List<ExamQuestionResponse> getQuestionsForExam(Long examId);

    List<ExamQuestionResponse> reorderQuestions(Long examId, List<Long> questionIdsInOrder);
}
