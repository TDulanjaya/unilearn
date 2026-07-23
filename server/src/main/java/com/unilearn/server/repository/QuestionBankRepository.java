package com.unilearn.server.repository;

import com.unilearn.server.model.QuestionBank;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface QuestionBankRepository extends JpaRepository<QuestionBank, Long> {

    List<QuestionBank> findByCourse_CourseId(Long courseId);

    List<QuestionBank> findByCreatedBy_ExaminerId(Long examinerId);
}
