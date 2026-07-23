package com.unilearn.server.repository;

import com.unilearn.server.model.Assignment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AssignmentRepository extends JpaRepository<Assignment, Long> {

    List<Assignment> findByCourseOffering_OfferingId(Long offeringId);

    List<Assignment> findByCreatedBy_LecturerId(Long lecturerId);
}
