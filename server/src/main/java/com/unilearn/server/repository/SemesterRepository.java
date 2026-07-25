package com.unilearn.server.repository;

import com.unilearn.server.model.Semester;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.stereotype.Repository;

import java.util.List;

@EnableJpaRepositories
public interface SemesterRepository extends JpaRepository<Semester, Long> {

    List<Semester> findByAcademicYear_AcademicYearId(Long academicYearId);
}
