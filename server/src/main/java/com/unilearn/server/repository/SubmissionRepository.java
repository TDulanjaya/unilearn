package com.unilearn.server.repository;

import com.unilearn.server.model.Submission;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@EnableJpaRepositories
public interface SubmissionRepository extends JpaRepository<Submission, Long> {

    List<Submission> findByAssignment_AssignmentId(Long assignmentId);

    List<Submission> findByStudent_StudentId(Long studentId);

    Optional<Submission> findByAssignment_AssignmentIdAndStudent_StudentId(Long assignmentId, Long studentId);
}
