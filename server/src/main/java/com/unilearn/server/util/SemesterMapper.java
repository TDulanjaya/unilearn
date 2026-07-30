package com.unilearn.server.util;

import com.unilearn.server.dto.request.SemesterRequest;
import com.unilearn.server.dto.response.SemesterResponse;
import com.unilearn.server.exception.ValidationException;
import com.unilearn.server.model.AcademicYear;
import com.unilearn.server.model.Semester;
import org.springframework.stereotype.Component;

@Component
public class SemesterMapper {

    public Semester toSemester(SemesterRequest request, AcademicYear academicYear) {
        if (request == null) {
            throw new ValidationException("Semester request cannot be null");
        }
        return Semester.builder()
                .name(request.getName())
                .startDate(request.getStartDate())
                .endDate(request.getEndDate())
                .academicYear(academicYear)
                .build();
    }

    public SemesterResponse toSemesterResponse(Semester semester) {
        if (semester == null) {
            throw new ValidationException("Semester cannot be null");
        }
        return SemesterResponse.builder()
                .semesterId(semester.getSemesterId())
                .name(semester.getName())
                .startDate(semester.getStartDate())
                .endDate(semester.getEndDate())
                .academicYearId(semester.getAcademicYear() != null ? semester.getAcademicYear().getAcademicYearId() : null)
                .academicYearLabel(semester.getAcademicYear() != null ? semester.getAcademicYear().getYearLabel() : null)
                .build();
    }
}
