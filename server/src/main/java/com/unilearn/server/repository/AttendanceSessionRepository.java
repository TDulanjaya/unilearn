package com.unilearn.server.repository;

import com.unilearn.server.model.AttendanceSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface AttendanceSessionRepository extends JpaRepository<AttendanceSession, Long> {

    List<AttendanceSession> findByCourseOffering_OfferingId(Long offeringId);

    List<AttendanceSession> findByCourseOffering_OfferingIdAndSessionDate(Long offeringId, LocalDate sessionDate);

    List<AttendanceSession> findByMarkedBy_LecturerId(Long lecturerId);
}
