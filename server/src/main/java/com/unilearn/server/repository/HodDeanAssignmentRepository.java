package com.unilearn.server.repository;

import com.unilearn.server.model.HodDeanAssignment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface HodDeanAssignmentRepository extends JpaRepository<HodDeanAssignment, Long> {

    List<HodDeanAssignment> findByUser_UserId(Long userId);

    List<HodDeanAssignment> findByFaculty_FacultyId(Long facultyId);

    List<HodDeanAssignment> findByDepartment_DepartmentId(Long departmentId);
}
