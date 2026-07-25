package com.unilearn.server.repository;

import com.unilearn.server.model.AiQuizQuestion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.stereotype.Repository;

import java.util.List;

@EnableJpaRepositories
public interface AiQuizQuestionRepository extends JpaRepository<AiQuizQuestion, Long> {

    List<AiQuizQuestion> findByQuizSession_SessionId(Long sessionId);

    List<AiQuizQuestion> findByQuizSession_SessionIdOrderByOrderNoAsc(Long sessionId);
}
