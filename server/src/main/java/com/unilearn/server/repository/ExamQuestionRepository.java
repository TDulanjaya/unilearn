package com.unilearn.server.repository;

import com.unilearn.server.model.ExamQuestion;
import com.unilearn.server.model.ExamQuestion.ExamQuestionId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ExamQuestionRepository extends JpaRepository<ExamQuestion, ExamQuestionId> {

    List<ExamQuestion> findByExam_ExamId(Long examId);

    List<ExamQuestion> findByQuestion_QuestionId(Long questionId);
}
