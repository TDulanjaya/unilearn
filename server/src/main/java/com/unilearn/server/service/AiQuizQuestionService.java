package com.unilearn.server.service;

import com.unilearn.server.dto.response.AiQuizQuestionResponse;

import java.util.List;

// Ai quiz questions service
public interface AiQuizQuestionService {

    List<AiQuizQuestionResponse> getQuestionsBySession(Long sessionId);

    AiQuizQuestionResponse answerQuestion(Long questionId, String studentAnswer);
}
