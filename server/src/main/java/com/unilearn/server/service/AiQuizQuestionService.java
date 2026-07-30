package com.unilearn.server.service;

import com.unilearn.server.dto.response.AiQuizQuestionResponse;

import java.util.List;

/**
 * Service interface for managing AI quiz questions.
 */
public interface AiQuizQuestionService {

    List<AiQuizQuestionResponse> getQuestionsBySession(Long sessionId);

    AiQuizQuestionResponse answerQuestion(Long questionId, String studentAnswer);
}
