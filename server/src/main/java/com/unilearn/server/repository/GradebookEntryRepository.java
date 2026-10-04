package com.unilearn.server.repository;

import com.unilearn.server.model.GradebookEntry;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@EnableJpaRepositories
public interface GradebookEntryRepository extends JpaRepository<GradebookEntry, Long> {

    List<GradebookEntry> findByCourseOffering_OfferingId(Long offeringId);

    List<GradebookEntry> findByStudent_StudentId(Long studentId);

    List<GradebookEntry> findByCourseOffering_OfferingIdAndStudent_StudentId(Long offeringId, Long studentId);

    // used to find an old row so we update it instead of adding a new one
    Optional<GradebookEntry> findFirstByCourseOffering_OfferingIdAndStudent_StudentIdAndComponentAndComponentRefId(
            Long offeringId, Long studentId, String component, Integer componentRefId);

    Optional<GradebookEntry> findFirstByCourseOffering_OfferingIdAndStudent_StudentIdAndComponentAndComponentRefIdIsNull(
            Long offeringId, Long studentId, String component);
}
