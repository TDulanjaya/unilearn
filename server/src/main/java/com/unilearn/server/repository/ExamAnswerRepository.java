package com.unilearn.server.repository;

import com.unilearn.server.model.ExamAnswer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ExamAnswerRepository extends JpaRepository<ExamAnswer, Long> {

    List<ExamAnswer> findByAttempt_AttemptId(Long attemptId);

    Optional<ExamAnswer> findByAttempt_AttemptIdAndQuestion_QuestionId(Long attemptId, Long questionId);
}
