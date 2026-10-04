package com.unilearn.server.repository;

import com.unilearn.server.model.ExamQuestion;
import com.unilearn.server.model.ExamQuestion.ExamQuestionId;
import com.unilearn.server.model.Question;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;

@EnableJpaRepositories
public interface ExamQuestionRepository extends JpaRepository<ExamQuestion, ExamQuestionId> {

    List<ExamQuestion> findByExam_ExamId(Long examId);

    List<ExamQuestion> findByQuestion_QuestionId(Long questionId);

    // full marks for a question in this exam (override first, then the question marks)
    default BigDecimal maxMarksFor(Long examId, Question question) {
        if (question == null) {
            return null;
        }
        if (examId != null && question.getQuestionId() != null) {
            BigDecimal override = findById(new ExamQuestionId(examId, question.getQuestionId()))
                    .map(ExamQuestion::getMarksOverride)
                    .orElse(null);
            if (override != null) {
                return override;
            }
        }
        return question.getMarks();
    }
}
