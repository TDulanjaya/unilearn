package com.unilearn.server.service;

import com.unilearn.server.dto.request.QuestionRequest;
import com.unilearn.server.dto.response.PageResponseDTO;
import com.unilearn.server.dto.response.QuestionResponse;
import org.springframework.data.domain.Pageable;

// Exam questions service
public interface QuestionService {

    QuestionResponse createQuestion(QuestionRequest request);

    QuestionResponse updateQuestion(Long questionId, QuestionRequest request);

    void deleteQuestion(Long questionId);

    QuestionResponse getQuestionById(Long questionId);

    PageResponseDTO<QuestionResponse> getQuestionsByBank(Long bankId, Pageable pageable);
}
