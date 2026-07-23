package com.unilearn.server.repository;

import com.unilearn.server.model.Examiner;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ExaminerRepository extends JpaRepository<Examiner, Long> {

    List<Examiner> findByDepartment_DepartmentId(Long departmentId);
}
