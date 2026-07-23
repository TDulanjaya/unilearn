package com.unilearn.server.repository;

import com.unilearn.server.model.Batch;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BatchRepository extends JpaRepository<Batch, Long> {

    List<Batch> findByDepartment_DepartmentId(Long departmentId);

    List<Batch> findByAcademicYear_AcademicYearId(Long academicYearId);

    List<Batch> findByDepartment_DepartmentIdAndAcademicYear_AcademicYearId(Long departmentId, Long academicYearId);
}
