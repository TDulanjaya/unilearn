package com.unilearn.server.repository;

import com.unilearn.server.model.ExamResult;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ExamResultRepository extends JpaRepository<ExamResult, Long> {

    List<ExamResult> findByExam_ExamId(Long examId);

    List<ExamResult> findByStudent_StudentId(Long studentId);

    Optional<ExamResult> findByExam_ExamIdAndStudent_StudentId(Long examId, Long studentId);
}
