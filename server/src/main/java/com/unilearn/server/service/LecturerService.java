package com.unilearn.server.service;

import com.unilearn.server.dto.request.LecturerRequest;
import com.unilearn.server.dto.response.CourseOfferingResponse;
import com.unilearn.server.dto.response.LecturerResponse;
import com.unilearn.server.dto.response.PageResponseDTO;
import com.unilearn.server.dto.response.lecturer.LecturerOptionDTO;
import org.springframework.data.domain.Pageable;

import java.util.List;

// Lecturers service
public interface LecturerService {

    LecturerResponse createLecturer(LecturerRequest request);

    LecturerResponse updateLecturer(Long lecturerId, LecturerRequest request);

    void deleteLecturer(Long lecturerId);

    LecturerResponse getLecturerById(Long lecturerId);

    PageResponseDTO<LecturerResponse> getLecturersByDepartment(Long departmentId, Pageable pageable);

    List<CourseOfferingResponse> getCourseOfferingsForLecturer(Long lecturerId);

    List<LecturerOptionDTO> getLecturerOptions(Long departmentId, String searchText);
}
