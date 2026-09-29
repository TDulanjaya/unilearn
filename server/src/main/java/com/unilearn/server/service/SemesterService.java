package com.unilearn.server.service;

import com.unilearn.server.dto.request.SemesterRequest;
import com.unilearn.server.dto.response.SemesterResponse;
import com.unilearn.server.dto.response.semester.SemesterOptionDTO;

import java.util.List;

// Semesters service
public interface SemesterService {

    SemesterResponse createSemester(SemesterRequest request);

    SemesterResponse updateSemester(Long semesterId, SemesterRequest request);

    void deleteSemester(Long semesterId);

    SemesterResponse getSemesterById(Long semesterId);

    List<SemesterResponse> getSemestersByAcademicYear(Long academicYearId);

    List<SemesterOptionDTO> getSemesterOptions(Long academicYearId, String searchText);

    List<SemesterResponse> getAllSemesters();
}
