package com.unilearn.server.util;

import com.unilearn.server.dto.request.QuestionRequest;
import com.unilearn.server.dto.response.QuestionResponse;
import com.unilearn.server.exception.ValidationException;
import com.unilearn.server.model.Question;
import com.unilearn.server.model.QuestionBank;
import org.springframework.stereotype.Component;

@Component
public class QuestionMapper {

    public Question toQuestion(QuestionRequest request, QuestionBank bank) {
        if (request == null) {
            throw new ValidationException("Question request cannot be null");
        }
        return Question.builder()
                .questionBank(bank)
                .questionText(request.getQuestionText())
                .questionType(request.getQuestionType())
                .options(request.getOptions())
                .correctAnswer(request.getCorrectAnswer())
                .marks(request.getMarks())
                .difficulty(request.getDifficulty())
                .topic(request.getTopic())
                .build();
    }

    public QuestionResponse toQuestionResponse(Question question) {
        if (question == null) {
            throw new ValidationException("Question cannot be null");
        }
        return QuestionResponse.builder()
                .questionId(question.getQuestionId())
                .bankId(question.getQuestionBank() != null ? question.getQuestionBank().getBankId() : null)
                .questionText(question.getQuestionText())
                .questionType(question.getQuestionType())
                .options(question.getOptions())
                .correctAnswer(question.getCorrectAnswer())
                .marks(question.getMarks())
                .difficulty(question.getDifficulty())
                .topic(question.getTopic())
                .build();
    }
}
