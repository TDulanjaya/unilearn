package com.unilearn.server.service;

import com.unilearn.server.dto.request.AiQuizQuestionRequest;
import com.unilearn.server.dto.request.AiQuizSessionRequest;
import com.unilearn.server.dto.response.AiQuizSessionResponse;

import java.util.List;

// Ai quiz sessions service
public interface AiQuizSessionService {

    AiQuizSessionResponse startQuizSession(AiQuizSessionRequest request);

    AiQuizSessionResponse submitQuizAnswers(Long sessionId, List<AiQuizQuestionRequest> answers);

    AiQuizSessionResponse getQuizSession(Long sessionId);
}
