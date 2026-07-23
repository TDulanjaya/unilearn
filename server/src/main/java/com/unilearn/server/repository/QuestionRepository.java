package com.unilearn.server.repository;

import com.unilearn.server.model.Question;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface QuestionRepository extends JpaRepository<Question, Long> {

    List<Question> findByQuestionBank_BankId(Long bankId);

    List<Question> findByQuestionBank_BankIdAndTopic(Long bankId, String topic);

    List<Question> findByQuestionBank_BankIdAndDifficulty(Long bankId, String difficulty);
}
