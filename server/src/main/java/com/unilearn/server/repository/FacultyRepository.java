package com.unilearn.server.repository;

import com.unilearn.server.model.Faculty;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface FacultyRepository extends JpaRepository<Faculty, Long> {

    Optional<Faculty> findByCode(String code);

    boolean existsByCode(String code);

    Optional<Faculty> findByDean_UserId(Long userId);
}
