package com.unilearn.server.util.mapper;

import com.unilearn.server.dto.request.ExamQuestionRequest;
import com.unilearn.server.dto.response.ExamQuestionResponse;
import com.unilearn.server.exception.ValidationException;
import com.unilearn.server.model.Exam;
import com.unilearn.server.model.ExamQuestion;
import com.unilearn.server.model.Question;
import org.springframework.stereotype.Component;

@Component
public class ExamQuestionMapper {

    public ExamQuestion toExamQuestion(ExamQuestionRequest request, Exam exam, Question question) {
        if (request == null) {
            throw new ValidationException("ExamQuestion request cannot be null");
        }
        return ExamQuestion.builder()
                .exam(exam)
                .question(question)
                .marksOverride(request.getMarksOverride())
                .build();
    }

    public ExamQuestionResponse toExamQuestionResponse(ExamQuestion eq) {
        if (eq == null) {
            throw new ValidationException("ExamQuestion cannot be null");
        }
        return ExamQuestionResponse.builder()
                .examId(eq.getExam() != null ? eq.getExam().getExamId() : null)
                .questionId(eq.getQuestion() != null ? eq.getQuestion().getQuestionId() : null)
                .questionText(eq.getQuestion() != null ? eq.getQuestion().getQuestionText() : null)
                .marks(eq.getQuestion() != null ? eq.getQuestion().getMarks() : null)
                .marksOverride(eq.getMarksOverride())
                .orderIndex(eq.getQuestionOrder())
                .build();
    }
}
