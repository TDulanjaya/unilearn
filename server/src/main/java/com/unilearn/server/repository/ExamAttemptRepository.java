package com.unilearn.server.repository;

import com.unilearn.server.model.ExamAttempt;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@EnableJpaRepositories
public interface ExamAttemptRepository extends JpaRepository<ExamAttempt, Long> {

    List<ExamAttempt> findByExam_ExamId(Long examId);

    List<ExamAttempt> findByStudent_StudentId(Long studentId);

    Optional<ExamAttempt> findByExam_ExamIdAndStudent_StudentId(Long examId, Long studentId);

    List<ExamAttempt> findByExam_ExamIdAndStatus(Long examId, String status);

    boolean existsByStudent_StudentIdAndStatus(Long studentId, String status);

    @org.springframework.data.jpa.repository.Query("SELECT COUNT(a) > 0 FROM ExamAttempt a WHERE a.student.studentId = :studentId AND (LOWER(a.status) = 'in_progress' OR a.endTime IS NULL)")
    boolean hasActiveExamAttempt(@org.springframework.data.repository.query.Param("studentId") Long studentId);
}
