package com.unilearn.server.repository;

import com.unilearn.server.model.Question;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

import java.util.List;

@EnableJpaRepositories
public interface QuestionRepository extends JpaRepository<Question, Long> {

    List<Question> findByQuestionBank_BankId(Long bankId);

    Page<Question> findByQuestionBank_BankId(Long bankId, Pageable pageable);

    List<Question> findByQuestionBank_BankIdAndTopic(Long bankId, String topic);

    List<Question> findByQuestionBank_BankIdAndDifficulty(Long bankId, String difficulty);
}
