package com.unilearn.server.repository;

import com.unilearn.server.model.ProctoringFlag;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProctoringFlagRepository extends JpaRepository<ProctoringFlag, Long> {

    List<ProctoringFlag> findByAttempt_AttemptId(Long attemptId);

    List<ProctoringFlag> findByAttempt_AttemptIdAndFlagType(Long attemptId, String flagType);
}
