package com.unilearn.server.repository;

import com.unilearn.server.model.AttendanceRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@EnableJpaRepositories
public interface AttendanceRecordRepository extends JpaRepository<AttendanceRecord, Long> {

    List<AttendanceRecord> findBySession_SessionId(Long sessionId);

    List<AttendanceRecord> findByStudent_StudentId(Long studentId);

    Optional<AttendanceRecord> findBySession_SessionIdAndStudent_StudentId(Long sessionId, Long studentId);

    // late also counts as attended
    @Query("SELECT COUNT(ar) * 100.0 / NULLIF(COUNT(s), 0) FROM AttendanceSession s " +
           "LEFT JOIN AttendanceRecord ar ON ar.session = s AND ar.student.studentId = :studentId " +
           "AND LOWER(ar.status) IN ('present', 'late') " +
           "WHERE s.courseOffering.offeringId = :offeringId")
    Double calculateAttendancePercentageByStudentAndOffering(@Param("studentId") Long studentId, @Param("offeringId") Long offeringId);
}
