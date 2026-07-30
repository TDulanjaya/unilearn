package com.unilearn.server.repository;

import com.unilearn.server.model.Student;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

import java.util.List;
import java.util.Optional;

@EnableJpaRepositories
public interface StudentRepository extends JpaRepository<Student, Long> {

    Optional<Student> findByStudentNo(String studentNo);

    boolean existsByStudentNo(String studentNo);

    List<Student> findByDepartment_DepartmentId(Long departmentId);

    Page<Student> findByDepartment_DepartmentId(Long departmentId, Pageable pageable);

    List<Student> findByBatch_BatchId(Long batchId);

    Page<Student> findByBatch_BatchId(Long batchId, Pageable pageable);

    List<Student> findByDepartment_DepartmentIdAndBatch_BatchId(Long departmentId, Long batchId);
}
