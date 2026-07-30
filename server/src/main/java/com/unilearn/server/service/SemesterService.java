package com.unilearn.server.service;

import com.unilearn.server.dto.request.SemesterRequest;
import com.unilearn.server.dto.response.SemesterResponse;

import java.util.List;

/**
 * Service interface for managing semesters.
 */
public interface SemesterService {

    SemesterResponse createSemester(SemesterRequest request);

    SemesterResponse updateSemester(Long semesterId, SemesterRequest request);

    void deleteSemester(Long semesterId);

    SemesterResponse getSemesterById(Long semesterId);

    List<SemesterResponse> getSemestersByAcademicYear(Long academicYearId);
}
