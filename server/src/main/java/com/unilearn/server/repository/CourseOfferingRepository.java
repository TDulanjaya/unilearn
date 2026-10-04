package com.unilearn.server.repository;

import com.unilearn.server.model.CourseOffering;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@EnableJpaRepositories
public interface CourseOfferingRepository extends JpaRepository<CourseOffering, Long> {

    List<CourseOffering> findByCourse_CourseId(Long courseId);

    List<CourseOffering> findByBatch_BatchId(Long batchId);

    List<CourseOffering> findBySemester_SemesterId(Long semesterId);

    List<CourseOffering> findByPrimaryLecturer_LecturerId(Long lecturerId);

    // is this lecturer the main lecturer of any offering of the course
    boolean existsByCourse_CourseIdAndPrimaryLecturer_LecturerId(Long courseId, Long lecturerId);

    Optional<CourseOffering> findByCourse_CourseIdAndBatch_BatchIdAndSemester_SemesterId(Long courseId, Long batchId, Long semesterId);

    // dropped students don't take a seat
    @Query("SELECT COUNT(e) FROM Enrollment e WHERE e.courseOffering.offeringId = :offeringId "
            + "AND (e.status IS NULL OR LOWER(e.status) <> 'dropped')")
    long countEnrollmentsByOfferingId(@Param("offeringId") Long offeringId);
}
