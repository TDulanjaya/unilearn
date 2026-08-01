package com.unilearn.server.util.mapper;

import com.unilearn.server.dto.response.AiQuizQuestionResponse;
import com.unilearn.server.exception.ValidationException;
import com.unilearn.server.model.AiQuizQuestion;
import org.springframework.stereotype.Component;

@Component
public class AiQuizQuestionMapper {

    public AiQuizQuestionResponse toAiQuizQuestionResponse(AiQuizQuestion question) {
        if (question == null) {
            throw new ValidationException("AiQuizQuestion cannot be null");
        }
        return AiQuizQuestionResponse.builder()
                .questionId(question.getQuestionId())
                .sessionId(question.getQuizSession() != null ? question.getQuizSession().getSessionId() : null)
                .orderNo(question.getOrderNo())
                .questionText(question.getQuestionText())
                .questionType(question.getQuestionType())
                .options(question.getOptions())
                .correctAnswer(question.getCorrectAnswer())
                .studentAnswer(question.getStudentAnswer())
                .isCorrect(question.getIsCorrect())
                .answerRevealed(question.getAnswerRevealed())
                .build();
    }
}
