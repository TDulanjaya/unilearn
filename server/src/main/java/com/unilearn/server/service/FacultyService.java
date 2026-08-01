package com.unilearn.server.service;

import com.unilearn.server.dto.request.FacultyRequest;
import com.unilearn.server.dto.response.FacultyResponse;
import com.unilearn.server.dto.response.PageResponseDTO;
import com.unilearn.server.dto.response.faculty.FacultyOptionDTO;
import org.springframework.data.domain.Pageable;

import java.util.List;

/**
 * Service interface for managing faculties within the UniLearn platform.
 */
public interface FacultyService {

    FacultyResponse createFaculty(FacultyRequest request);

    FacultyResponse updateFaculty(Long facultyId, FacultyRequest request);

    void deleteFaculty(Long facultyId);

    FacultyResponse getFacultyById(Long facultyId);

    FacultyResponse getFacultyByCode(String code);

    PageResponseDTO<FacultyResponse> getAllFaculties(Pageable pageable);

    List<FacultyOptionDTO> getFacultyOptions(String searchText);
}
