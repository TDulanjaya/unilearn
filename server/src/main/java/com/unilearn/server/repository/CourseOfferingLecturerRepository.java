package com.unilearn.server.repository;

import com.unilearn.server.model.CourseOfferingLecturer;
import com.unilearn.server.model.CourseOfferingLecturer.CourseOfferingLecturerId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.stereotype.Repository;

import java.util.List;

@EnableJpaRepositories
public interface CourseOfferingLecturerRepository extends JpaRepository<CourseOfferingLecturer, CourseOfferingLecturerId> {

    List<CourseOfferingLecturer> findByCourseOffering_OfferingId(Long offeringId);

    List<CourseOfferingLecturer> findByLecturer_LecturerId(Long lecturerId);
}
