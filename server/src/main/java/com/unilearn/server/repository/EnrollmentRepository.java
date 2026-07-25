package com.unilearn.server.repository;

import com.unilearn.server.model.Enrollment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@EnableJpaRepositories
public interface EnrollmentRepository extends JpaRepository<Enrollment, Long> {

    List<Enrollment> findByStudent_StudentId(Long studentId);

    List<Enrollment> findByCourseOffering_OfferingId(Long offeringId);

    Optional<Enrollment> findByStudent_StudentIdAndCourseOffering_OfferingId(Long studentId, Long offeringId);

    boolean existsByStudent_StudentIdAndCourseOffering_OfferingId(Long studentId, Long offeringId);
}
