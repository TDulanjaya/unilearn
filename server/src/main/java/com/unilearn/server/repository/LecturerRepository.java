package com.unilearn.server.repository;

import com.unilearn.server.model.Lecturer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LecturerRepository extends JpaRepository<Lecturer, Long> {

    List<Lecturer> findByDepartment_DepartmentId(Long departmentId);

    List<Lecturer> findByIsGuest(Boolean isGuest);
}
