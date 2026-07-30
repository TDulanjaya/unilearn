package com.unilearn.server.service;

import com.unilearn.server.dto.request.CourseOfferingRequest;
import com.unilearn.server.dto.response.CourseOfferingResponse;

import java.util.List;

/**
 * Service interface for managing course offerings.
 */
public interface CourseOfferingService {

    CourseOfferingResponse createCourseOffering(CourseOfferingRequest request);

    CourseOfferingResponse updateCourseOffering(Long offeringId, CourseOfferingRequest request);

    void deleteCourseOffering(Long offeringId);

    CourseOfferingResponse getCourseOfferingById(Long offeringId);

    List<CourseOfferingResponse> getOfferingsByCourse(Long courseId);

    List<CourseOfferingResponse> getOfferingsByBatch(Long batchId);

    List<CourseOfferingResponse> getOfferingsBySemester(Long semesterId);

    List<CourseOfferingResponse> getOfferingsByLecturer(Long lecturerId);

    long getEnrollmentCount(Long offeringId);
}
