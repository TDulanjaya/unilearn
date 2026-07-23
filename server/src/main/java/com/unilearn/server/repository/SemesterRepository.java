package com.unilearn.server.repository;

import com.unilearn.server.model.Semester;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SemesterRepository extends JpaRepository<Semester, Long> {

    List<Semester> findByAcademicYear_AcademicYearId(Long academicYearId);
}
