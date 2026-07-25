package com.unilearn.server.repository;

import com.unilearn.server.model.Announcement;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.stereotype.Repository;

import java.util.List;

@EnableJpaRepositories
public interface AnnouncementRepository extends JpaRepository<Announcement, Long> {

    List<Announcement> findByScope(String scope);

    List<Announcement> findByCourseOffering_OfferingId(Long offeringId);

    List<Announcement> findByDepartment_DepartmentId(Long departmentId);

    List<Announcement> findByFaculty_FacultyId(Long facultyId);
}
