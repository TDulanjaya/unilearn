package com.unilearn.server.service;

import com.unilearn.server.dto.request.CourseOfferingRequest;
import com.unilearn.server.dto.response.CourseOfferingResponse;
import com.unilearn.server.dto.response.courseoffering.CourseOfferingListItemDTO;

import java.util.List;

// Course offerings service
public interface CourseOfferingService {

    CourseOfferingResponse createCourseOffering(CourseOfferingRequest request);

    CourseOfferingResponse updateCourseOffering(Long offeringId, CourseOfferingRequest request);

    void deleteCourseOffering(Long offeringId);

    CourseOfferingResponse getCourseOfferingById(Long offeringId);

    List<CourseOfferingResponse> getOfferingsByCourse(Long courseId);

    List<CourseOfferingResponse> getOfferingsByBatch(Long batchId);

    List<CourseOfferingResponse> getOfferingsBySemester(Long semesterId);

    List<CourseOfferingResponse> getOfferingsByLecturer(Long lecturerId);

    List<CourseOfferingListItemDTO> getOfferingListItemsByBatch(Long batchId);

    long getEnrollmentCount(Long offeringId);

    List<CourseOfferingResponse> getAllCourseOfferings();
}
