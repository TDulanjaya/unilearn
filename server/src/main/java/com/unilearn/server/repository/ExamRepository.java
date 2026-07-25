package com.unilearn.server.repository;

import com.unilearn.server.model.Exam;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@EnableJpaRepositories
public interface ExamRepository extends JpaRepository<Exam, Long> {

    List<Exam> findByCourseOffering_OfferingId(Long offeringId);

    List<Exam> findByExamDate(LocalDate examDate);

    List<Exam> findByCourseOffering_OfferingIdAndExamType(Long offeringId, String examType);

    @Query("SELECT e FROM Exam e WHERE e.courseOffering.batch.batchId = :batchId AND e.examType = 'in_class' AND e.linkedSlot IS NOT NULL AND e.examDate >= :currentDate ORDER BY e.examDate ASC, e.startTime ASC")
    List<Exam> findUpcomingInClassExamsForBatch(@Param("batchId") Long batchId, @Param("currentDate") LocalDate currentDate);
}
