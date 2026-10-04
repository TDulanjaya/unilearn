package com.unilearn.server.repository;

import com.unilearn.server.model.CourseOfferingLecturer;
import com.unilearn.server.model.CourseOfferingLecturer.CourseOfferingLecturerId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

import java.util.List;

@EnableJpaRepositories
public interface CourseOfferingLecturerRepository extends JpaRepository<CourseOfferingLecturer, CourseOfferingLecturerId> {

    List<CourseOfferingLecturer> findByCourseOffering_OfferingId(Long offeringId);

    List<CourseOfferingLecturer> findByLecturer_LecturerId(Long lecturerId);

    // how many offerings of the course this lecturer is assigned to
    @org.springframework.data.jpa.repository.Query("SELECT COUNT(c) FROM CourseOfferingLecturer c WHERE c.courseOffering.course.courseId = :courseId AND c.lecturer.lecturerId = :lecturerId")
    long countByCourseAndLecturer(@org.springframework.data.repository.query.Param("courseId") Long courseId,
                                  @org.springframework.data.repository.query.Param("lecturerId") Long lecturerId);
}
