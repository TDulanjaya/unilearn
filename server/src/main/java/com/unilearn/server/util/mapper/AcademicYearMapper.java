package com.unilearn.server.util.mapper;

import com.unilearn.server.dto.request.AcademicYearRequest;
import com.unilearn.server.dto.response.AcademicYearResponse;
import com.unilearn.server.exception.ValidationException;
import com.unilearn.server.model.AcademicYear;
import org.springframework.stereotype.Component;

@Component
public class AcademicYearMapper {

    public AcademicYear toAcademicYear(AcademicYearRequest request) {
        if (request == null) {
            throw new ValidationException("Academic year request cannot be null");
        }
        return AcademicYear.builder()
                .yearLabel(request.getYearLabel())
                .startDate(request.getStartDate())
                .endDate(request.getEndDate())
                .isCurrent(request.getIsCurrent() != null ? request.getIsCurrent() : false)
                .build();
    }

    public AcademicYearResponse toAcademicYearResponse(AcademicYear academicYear) {
        if (academicYear == null) {
            throw new ValidationException("Academic year cannot be null");
        }
        return AcademicYearResponse.builder()
                .academicYearId(academicYear.getAcademicYearId())
                .yearLabel(academicYear.getYearLabel())
                .startDate(academicYear.getStartDate())
                .endDate(academicYear.getEndDate())
                .isCurrent(academicYear.getIsCurrent())
                .build();
    }
}
