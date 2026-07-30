package com.unilearn.server.service;

import com.unilearn.server.dto.request.AcademicYearRequest;
import com.unilearn.server.dto.response.AcademicYearResponse;
import com.unilearn.server.dto.response.PageResponseDTO;
import org.springframework.data.domain.Pageable;

/**
 * Service interface for managing academic years.
 */
public interface AcademicYearService {

    AcademicYearResponse createAcademicYear(AcademicYearRequest request);

    AcademicYearResponse updateAcademicYear(Long academicYearId, AcademicYearRequest request);

    void deleteAcademicYear(Long academicYearId);

    AcademicYearResponse getAcademicYearById(Long academicYearId);

    PageResponseDTO<AcademicYearResponse> getAllAcademicYears(Pageable pageable);

    AcademicYearResponse setCurrentAcademicYear(Long academicYearId);
}
