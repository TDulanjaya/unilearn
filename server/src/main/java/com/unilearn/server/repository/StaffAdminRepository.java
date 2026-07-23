package com.unilearn.server.repository;

import com.unilearn.server.model.StaffAdmin;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface StaffAdminRepository extends JpaRepository<StaffAdmin, Long> {

    List<StaffAdmin> findByScopeLevel(String scopeLevel);

    List<StaffAdmin> findByFaculty_FacultyId(Long facultyId);

    List<StaffAdmin> findByDepartment_DepartmentId(Long departmentId);
}
