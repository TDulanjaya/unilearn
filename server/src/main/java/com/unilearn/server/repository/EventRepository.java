package com.unilearn.server.repository;

import com.unilearn.server.model.Event;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

import java.time.LocalDateTime;
import java.util.List;

@EnableJpaRepositories
public interface EventRepository extends JpaRepository<Event, Long> {

    List<Event> findByFaculty_FacultyId(Long facultyId);

    List<Event> findByEventDateAfter(LocalDateTime date);

    Page<Event> findByEventDateAfter(LocalDateTime date, Pageable pageable);

    List<Event> findByCreatedBy_StaffId(Long staffId);
}
