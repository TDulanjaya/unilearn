package com.unilearn.server.repository;

import com.unilearn.server.model.Student;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface StudentRepository extends JpaRepository<Student, Long> {

    Optional<Student> findByStudentNo(String studentNo);

    boolean existsByStudentNo(String studentNo);

    List<Student> findByDepartment_DepartmentId(Long departmentId);

    List<Student> findByBatch_BatchId(Long batchId);

    List<Student> findByDepartment_DepartmentIdAndBatch_BatchId(Long departmentId, Long batchId);
}
