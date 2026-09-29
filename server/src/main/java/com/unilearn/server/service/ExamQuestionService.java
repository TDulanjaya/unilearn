package com.unilearn.server.service;

import com.unilearn.server.dto.request.ExamQuestionRequest;
import com.unilearn.server.dto.response.ExamQuestionResponse;

import java.util.List;

// Exam questions service
public interface ExamQuestionService {

    ExamQuestionResponse addQuestionToExam(ExamQuestionRequest request);

    void removeQuestionFromExam(Long examId, Long questionId);

    List<ExamQuestionResponse> getQuestionsForExam(Long examId);

    List<com.unilearn.server.dto.response.StudentExamQuestionResponse> getStudentQuestionsForExam(Long examId);

    List<ExamQuestionResponse> reorderQuestions(Long examId, List<Long> questionIdsInOrder);
}
