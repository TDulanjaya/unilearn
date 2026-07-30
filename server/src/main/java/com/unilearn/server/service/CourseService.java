package com.unilearn.server.service;

import com.unilearn.server.dto.request.CourseRequest;
import com.unilearn.server.dto.response.CourseResponse;
import com.unilearn.server.dto.response.PageResponseDTO;
import org.springframework.data.domain.Pageable;

/**
 * Service interface for managing courses.
 */
public interface CourseService {

    CourseResponse createCourse(CourseRequest request);

    CourseResponse updateCourse(Long courseId, CourseRequest request);

    void deleteCourse(Long courseId);

    CourseResponse getCourseById(Long courseId);

    PageResponseDTO<CourseResponse> getCoursesByDepartment(Long departmentId, Pageable pageable);

    PageResponseDTO<CourseResponse> getAllCourses(Pageable pageable);
}
