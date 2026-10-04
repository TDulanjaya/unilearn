package com.unilearn.server.repository;

import com.unilearn.server.model.Enrollment;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

@EnableJpaRepositories
public interface EnrollmentRepository extends JpaRepository<Enrollment, Long> {

    List<Enrollment> findByStudent_StudentId(Long studentId);

    List<Enrollment> findByCourseOffering_OfferingId(Long offeringId);

    Page<Enrollment> findByCourseOffering_OfferingId(Long offeringId, Pageable pageable);

    Optional<Enrollment> findByStudent_StudentIdAndCourseOffering_OfferingId(Long studentId, Long offeringId);

    // dropped enrollments don't count as enrolled
    @Query("SELECT COUNT(e) > 0 FROM Enrollment e WHERE e.student.studentId = :studentId "
            + "AND e.courseOffering.offeringId = :offeringId "
            + "AND (e.status IS NULL OR LOWER(e.status) <> 'dropped')")
    boolean existsByStudent_StudentIdAndCourseOffering_OfferingId(@Param("studentId") Long studentId,
                                                                   @Param("offeringId") Long offeringId);
}
