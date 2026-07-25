package com.unilearn.server.repository;

import com.unilearn.server.model.AiQuizSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.stereotype.Repository;

import java.util.List;

@EnableJpaRepositories
public interface AiQuizSessionRepository extends JpaRepository<AiQuizSession, Long> {

    List<AiQuizSession> findByStudent_StudentId(Long studentId);

    List<AiQuizSession> findByStudent_StudentIdAndCourseOffering_OfferingId(Long studentId, Long offeringId);
}
