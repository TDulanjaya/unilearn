package com.unilearn.server.repository;

import com.unilearn.server.model.Announcement;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

import java.util.List;

@EnableJpaRepositories
public interface AnnouncementRepository extends JpaRepository<Announcement, Long> {

    List<Announcement> findByScope(String scope);

    Page<Announcement> findByScope(String scope, Pageable pageable);

    List<Announcement> findByCourseOffering_OfferingId(Long offeringId);

    Page<Announcement> findByCourseOffering_OfferingId(Long offeringId, Pageable pageable);

    List<Announcement> findByDepartment_DepartmentId(Long departmentId);

    Page<Announcement> findByDepartment_DepartmentId(Long departmentId, Pageable pageable);

    List<Announcement> findByFaculty_FacultyId(Long facultyId);

    Page<Announcement> findByFaculty_FacultyId(Long facultyId, Pageable pageable);
}
