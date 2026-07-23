package com.unilearn.server.repository;

import com.unilearn.server.model.Event;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface EventRepository extends JpaRepository<Event, Long> {

    List<Event> findByFaculty_FacultyId(Long facultyId);

    List<Event> findByEventDateAfter(LocalDateTime date);

    List<Event> findByCreatedBy_StaffId(Long staffId);
}
