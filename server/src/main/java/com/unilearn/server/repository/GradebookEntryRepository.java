package com.unilearn.server.repository;

import com.unilearn.server.model.GradebookEntry;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface GradebookEntryRepository extends JpaRepository<GradebookEntry, Long> {

    List<GradebookEntry> findByCourseOffering_OfferingId(Long offeringId);

    List<GradebookEntry> findByStudent_StudentId(Long studentId);

    List<GradebookEntry> findByCourseOffering_OfferingIdAndStudent_StudentId(Long offeringId, Long studentId);
}
