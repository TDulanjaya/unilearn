package com.unilearn.server.repository;

import com.unilearn.server.model.ExamAttempt;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ExamAttemptRepository extends JpaRepository<ExamAttempt, Long> {

    List<ExamAttempt> findByExam_ExamId(Long examId);

    List<ExamAttempt> findByStudent_StudentId(Long studentId);

    Optional<ExamAttempt> findByExam_ExamIdAndStudent_StudentId(Long examId, Long studentId);

    List<ExamAttempt> findByExam_ExamIdAndStatus(Long examId, String status);
}
