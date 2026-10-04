package com.unilearn.server.repository;

import com.unilearn.server.model.PersonalResource;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

import java.util.List;

@EnableJpaRepositories
public interface PersonalResourceRepository extends JpaRepository<PersonalResource, Long> {

    List<PersonalResource> findByStudent_StudentId(Long studentId);

    Page<PersonalResource> findByStudent_StudentId(Long studentId, Pageable pageable);

    List<PersonalResource> findByStudent_StudentIdAndCourseOffering_OfferingId(Long studentId, Long offeringId);

    Page<PersonalResource> findByStudent_StudentIdAndCourseOffering_OfferingId(Long studentId, Long offeringId, Pageable pageable);

    List<PersonalResource> findByCourseOffering_OfferingId(Long offeringId);

    long countByStudent_StudentId(Long studentId);

    long countByStudent_StudentIdAndCourseOffering_OfferingId(Long studentId, Long offeringId);

    // used by file download to find who owns a file
    @org.springframework.data.jpa.repository.Query("SELECT r FROM PersonalResource r WHERE r.fileUrl LIKE CONCAT('%', :fileUrl, '%')")
    List<PersonalResource> findAllByFileUrlLike(@org.springframework.data.repository.query.Param("fileUrl") String fileUrl);
}
