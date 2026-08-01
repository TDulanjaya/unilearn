package com.unilearn.server.service.impl;

import com.unilearn.server.dto.response.AiQuizQuestionResponse;
import com.unilearn.server.exception.EntryNotFoundException;
import com.unilearn.server.exception.ValidationException;
import com.unilearn.server.model.AiQuizQuestion;
import com.unilearn.server.repository.AiQuizQuestionRepository;
import com.unilearn.server.repository.AiQuizSessionRepository;
import com.unilearn.server.service.AiQuizQuestionService;
import com.unilearn.server.util.mapper.AiQuizQuestionMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AiQuizQuestionServiceImpl implements AiQuizQuestionService {

    private final AiQuizQuestionRepository aiQuizQuestionRepository;
    private final AiQuizSessionRepository aiQuizSessionRepository;
    private final AiQuizQuestionMapper aiQuizQuestionMapper;

    @Override
    public List<AiQuizQuestionResponse> getQuestionsBySession(Long sessionId) {
        if (sessionId == null) {
            throw new ValidationException("Session ID cannot be null");
        }
        if (!aiQuizSessionRepository.existsById(sessionId)) {
            throw new EntryNotFoundException("AiQuizSession not found with ID: " + sessionId);
        }

        return aiQuizQuestionRepository.findByQuizSession_SessionIdOrderByOrderNoAsc(sessionId)
                .stream()
                .map(aiQuizQuestionMapper::toAiQuizQuestionResponse)
                .toList();
    }

    @Override
    @Transactional
    public AiQuizQuestionResponse answerQuestion(Long questionId, String studentAnswer) {
        if (questionId == null) {
            throw new ValidationException("Question ID cannot be null");
        }
        if (studentAnswer == null) {
            throw new ValidationException("Student answer cannot be null");
        }

        AiQuizQuestion question = aiQuizQuestionRepository.findById(questionId)
                .orElseThrow(() -> new EntryNotFoundException("AiQuizQuestion not found with ID: " + questionId));

        question.setStudentAnswer(studentAnswer);
        question.setAnswerRevealed(true);
        if (question.getCorrectAnswer() != null) {
            question.setIsCorrect(question.getCorrectAnswer().trim().equalsIgnoreCase(studentAnswer.trim()));
        }

        AiQuizQuestion updated = aiQuizQuestionRepository.save(question);
        return aiQuizQuestionMapper.toAiQuizQuestionResponse(updated);
    }
}
