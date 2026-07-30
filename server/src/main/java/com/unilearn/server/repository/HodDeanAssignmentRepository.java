package com.unilearn.server.repository;

import com.unilearn.server.model.HodDeanAssignment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

import java.util.List;
import java.util.Optional;

@EnableJpaRepositories
public interface HodDeanAssignmentRepository extends JpaRepository<HodDeanAssignment, Long> {

    List<HodDeanAssignment> findByUser_UserId(Long userId);

    List<HodDeanAssignment> findByFaculty_FacultyId(Long facultyId);

    Optional<HodDeanAssignment> findByFaculty_FacultyIdAndActiveTrue(Long facultyId);

    List<HodDeanAssignment> findByDepartment_DepartmentId(Long departmentId);

    Optional<HodDeanAssignment> findByDepartment_DepartmentIdAndActiveTrue(Long departmentId);
}
