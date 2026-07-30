package com.unilearn.server.repository;

import com.unilearn.server.model.Lecturer;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

import java.util.List;

@EnableJpaRepositories
public interface LecturerRepository extends JpaRepository<Lecturer, Long> {

    List<Lecturer> findByDepartment_DepartmentId(Long departmentId);

    Page<Lecturer> findByDepartment_DepartmentId(Long departmentId, Pageable pageable);

    List<Lecturer> findByIsGuest(Boolean isGuest);
}
