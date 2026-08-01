package com.unilearn.server.service.impl;

import com.unilearn.server.dto.request.SemesterRequest;
import com.unilearn.server.dto.response.SemesterResponse;
import com.unilearn.server.exception.EntryNotFoundException;
import com.unilearn.server.exception.ValidationException;
import com.unilearn.server.model.AcademicYear;
import com.unilearn.server.model.Semester;
import com.unilearn.server.repository.AcademicYearRepository;
import com.unilearn.server.repository.SemesterRepository;
import com.unilearn.server.service.SemesterService;
import com.unilearn.server.util.mapper.SemesterMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class SemesterServiceImpl implements SemesterService {

    private final SemesterRepository semesterRepository;
    private final AcademicYearRepository academicYearRepository;
    private final SemesterMapper semesterMapper;

    @Override
    @Transactional
    public SemesterResponse createSemester(SemesterRequest request) {
        if (request == null) {
            throw new ValidationException("Semester request cannot be null");
        }

        AcademicYear academicYear = academicYearRepository.findById(request.getAcademicYearId())
                .orElseThrow(() -> new EntryNotFoundException("AcademicYear not found with ID: " + request.getAcademicYearId()));

        if (request.getStartDate().isBefore(academicYear.getStartDate()) || request.getEndDate().isAfter(academicYear.getEndDate())) {
            throw new com.unilearn.server.exception.IllegalStateException("Semester dates must fall within the academic year");
        }

        Semester semester = semesterMapper.toSemester(request, academicYear);
        Semester saved = semesterRepository.save(semester);
        return semesterMapper.toSemesterResponse(saved);
    }

    @Override
    @Transactional
    public SemesterResponse updateSemester(Long semesterId, SemesterRequest request) {
        if (semesterId == null) {
            throw new ValidationException("Semester ID cannot be null");
        }
        if (request == null) {
            throw new ValidationException("Semester request cannot be null");
        }

        Semester semester = semesterRepository.findById(semesterId)
                .orElseThrow(() -> new EntryNotFoundException("Semester not found with ID: " + semesterId));

        AcademicYear academicYear = academicYearRepository.findById(request.getAcademicYearId())
                .orElseThrow(() -> new EntryNotFoundException("AcademicYear not found with ID: " + request.getAcademicYearId()));

        if (request.getStartDate().isBefore(academicYear.getStartDate()) || request.getEndDate().isAfter(academicYear.getEndDate())) {
            throw new com.unilearn.server.exception.IllegalStateException("Semester dates must fall within the academic year");
        }

        semester.setName(request.getName());
        semester.setStartDate(request.getStartDate());
        semester.setEndDate(request.getEndDate());
        semester.setAcademicYear(academicYear);

        Semester updated = semesterRepository.save(semester);
        return semesterMapper.toSemesterResponse(updated);
    }

    @Override
    @Transactional
    public void deleteSemester(Long semesterId) {
        if (semesterId == null) {
            throw new ValidationException("Semester ID cannot be null");
        }
        if (!semesterRepository.existsById(semesterId)) {
            throw new EntryNotFoundException("Semester not found with ID: " + semesterId);
        }
        semesterRepository.deleteById(semesterId);
    }

    @Override
    public SemesterResponse getSemesterById(Long semesterId) {
        if (semesterId == null) {
            throw new ValidationException("Semester ID cannot be null");
        }
        Semester semester = semesterRepository.findById(semesterId)
                .orElseThrow(() -> new EntryNotFoundException("Semester not found with ID: " + semesterId));
        return semesterMapper.toSemesterResponse(semester);
    }

    @Override
    public List<SemesterResponse> getSemestersByAcademicYear(Long academicYearId) {
        if (academicYearId == null) {
            throw new ValidationException("Academic year ID cannot be null");
        }
        if (!academicYearRepository.existsById(academicYearId)) {
            throw new EntryNotFoundException("AcademicYear not found with ID: " + academicYearId);
        }

        return semesterRepository.findByAcademicYear_AcademicYearId(academicYearId)
                .stream()
                .map(semesterMapper::toSemesterResponse)
                .toList();
    }

    @Override
    public List<com.unilearn.server.dto.response.semester.SemesterOptionDTO> getSemesterOptions(Long academicYearId, String searchText) {
        String filter = (searchText == null) ? "" : searchText.trim().toLowerCase();
        List<Semester> semesters = (academicYearId != null)
                ? semesterRepository.findByAcademicYear_AcademicYearId(academicYearId)
                : semesterRepository.findAll();

        return semesters.stream()
                .filter(s -> filter.isEmpty() || s.getName().toLowerCase().contains(filter))
                .map(semesterMapper::toSemesterOptionDTO)
                .toList();
    }
}
