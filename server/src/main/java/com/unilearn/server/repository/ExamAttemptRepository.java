package com.unilearn.server.repository;

import com.unilearn.server.model.Exam;
import com.unilearn.server.model.ExamAttempt;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@EnableJpaRepositories
public interface ExamAttemptRepository extends JpaRepository<ExamAttempt, Long> {

    List<ExamAttempt> findByExam_ExamId(Long examId);

    List<ExamAttempt> findByStudent_StudentId(Long studentId);

    Optional<ExamAttempt> findByExam_ExamIdAndStudent_StudentId(Long examId, Long studentId);

    List<ExamAttempt> findByExam_ExamIdAndStatus(Long examId, String status);

    boolean existsByStudent_StudentIdAndStatus(Long studentId, String status);

    // attempts that are started but not submitted yet
    @Query("SELECT a FROM ExamAttempt a WHERE a.student.studentId = :studentId AND a.endTime IS NULL AND a.startTime IS NOT NULL AND (a.status IS NULL OR LOWER(a.status) <> 'submitted')")
    List<ExamAttempt> findOpenAttemptsByStudent(@Param("studentId") Long studentId);

    // an attempt only counts as active until its exam time is over
    default boolean hasActiveExamAttempt(Long studentId) {
        LocalDateTime now = LocalDateTime.now();
        for (ExamAttempt attempt : findOpenAttemptsByStudent(studentId)) {
            LocalDateTime deadline = deadlineOf(attempt);
            if (deadline != null && now.isBefore(deadline)) {
                return true;
            }
        }
        return false;
    }

    // last time the student can answer: start time + duration, but not after the exam end time
    default LocalDateTime deadlineOf(ExamAttempt attempt) {
        if (attempt == null || attempt.getStartTime() == null) {
            return null;
        }
        Exam exam = attempt.getExam();
        if (exam == null || exam.getDurationMinutes() == null) {
            return null;
        }
        LocalDateTime deadline = attempt.getStartTime().plusMinutes(exam.getDurationMinutes());
        if (exam.getExamDate() != null && exam.getStartTime() != null && exam.getEndTime() != null
                && exam.getEndTime().isAfter(exam.getStartTime())) {
            LocalDateTime examEnd = exam.getExamDate().atTime(exam.getEndTime());
            if (examEnd.isBefore(deadline)) {
                deadline = examEnd;
            }
        }
        return deadline;
    }
}
