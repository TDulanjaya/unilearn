package com.unilearn.server.repository;

import com.unilearn.server.model.QuestionBank;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.stereotype.Repository;

import java.util.List;

@EnableJpaRepositories
public interface QuestionBankRepository extends JpaRepository<QuestionBank, Long> {

    List<QuestionBank> findByCourse_CourseId(Long courseId);

    List<QuestionBank> findByCreatedBy_UserId(Long userId);
}
