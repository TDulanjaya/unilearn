package com.unilearn.server.service;

import com.unilearn.server.dto.request.CourseOfferingLecturerRequest;
import com.unilearn.server.dto.response.CourseOfferingLecturerResponse;
import com.unilearn.server.dto.response.CourseOfferingResponse;
import com.unilearn.server.dto.response.LecturerResponse;

import java.util.List;

// Course offering secondary lecturers service
public interface CourseOfferingLecturerService {

    CourseOfferingLecturerResponse assignLecturer(CourseOfferingLecturerRequest request);

    void removeLecturer(Long offeringId, Long lecturerId);

    List<LecturerResponse> getLecturersForOffering(Long offeringId);

    List<CourseOfferingResponse> getOfferingsForLecturer(Long lecturerId);
}
