package com.unilearn.server.repository;

import com.unilearn.server.model.EventRegistration;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@EnableJpaRepositories
public interface EventRegistrationRepository extends JpaRepository<EventRegistration, Long> {

    List<EventRegistration> findByEvent_EventId(Long eventId);

    List<EventRegistration> findByStudent_StudentId(Long studentId);

    Optional<EventRegistration> findByEvent_EventIdAndStudent_StudentId(Long eventId, Long studentId);

    boolean existsByEvent_EventIdAndStudent_StudentId(Long eventId, Long studentId);
}
