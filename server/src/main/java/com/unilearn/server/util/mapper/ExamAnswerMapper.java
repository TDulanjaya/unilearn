package com.unilearn.server.util.mapper;

import com.unilearn.server.dto.request.ExamAnswerRequest;
import com.unilearn.server.dto.response.ExamAnswerResponse;
import com.unilearn.server.exception.ValidationException;
import com.unilearn.server.model.ExamAnswer;
import com.unilearn.server.model.ExamAttempt;
import com.unilearn.server.model.Question;
import org.springframework.stereotype.Component;

@Component
public class ExamAnswerMapper {

    public ExamAnswer toExamAnswer(ExamAnswerRequest request, ExamAttempt attempt, Question question) {
        if (request == null) {
            throw new ValidationException("ExamAnswer request cannot be null");
        }
        String text = request.getAnswerText() != null ? request.getAnswerText() : request.getSelectedOption();
        return ExamAnswer.builder()
                .attempt(attempt)
                .question(question)
                .answerText(text)
                .marksAwarded(request.getMarksAwarded())
                .build();
    }

    public ExamAnswerResponse toExamAnswerResponse(ExamAnswer answer) {
        if (answer == null) {
            throw new ValidationException("ExamAnswer cannot be null");
        }
        return ExamAnswerResponse.builder()
                .answerId(answer.getAnswerId())
                .attemptId(answer.getAttempt() != null ? answer.getAttempt().getAttemptId() : null)
                .questionId(answer.getQuestion() != null ? answer.getQuestion().getQuestionId() : null)
                .answerText(answer.getAnswerText())
                .selectedOption(answer.getAnswerText())
                .isCorrect(answer.getIsCorrect())
                .marksAwarded(answer.getMarksAwarded())
                .gradedById(answer.getGradedBy() != null ? answer.getGradedBy().getExaminerId() : null)
                .gradedByName(answer.getGradedBy() != null && answer.getGradedBy().getUser() != null ? answer.getGradedBy().getUser().getFullName() : null)
                .build();
    }
}
