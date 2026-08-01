package com.unilearn.server.service.impl;

import com.unilearn.server.dto.request.AcademicYearRequest;
import com.unilearn.server.dto.response.AcademicYearResponse;
import com.unilearn.server.dto.response.PageResponseDTO;
import com.unilearn.server.exception.EntryNotFoundException;
import com.unilearn.server.exception.ValidationException;
import com.unilearn.server.model.AcademicYear;
import com.unilearn.server.repository.AcademicYearRepository;
import com.unilearn.server.service.AcademicYearService;
import com.unilearn.server.util.mapper.AcademicYearMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AcademicYearServiceImpl implements AcademicYearService {

    private final AcademicYearRepository academicYearRepository;
    private final AcademicYearMapper academicYearMapper;

    @Override
    @Transactional
    public AcademicYearResponse createAcademicYear(AcademicYearRequest request) {
        if (request == null) {
            throw new ValidationException("Academic year request cannot be null");
        }

        List<AcademicYear> allYears = academicYearRepository.findAll();
        boolean overlaps = allYears.stream().anyMatch(y ->
                (request.getStartDate().isBefore(y.getEndDate()) && request.getEndDate().isAfter(y.getStartDate()))
        );

        if (overlaps) {
            throw new com.unilearn.server.exception.IllegalStateException("Academic year date range overlaps an existing year");
        }

        AcademicYear academicYear = academicYearMapper.toAcademicYear(request);
        AcademicYear saved = academicYearRepository.save(academicYear);
        return academicYearMapper.toAcademicYearResponse(saved);
    }

    @Override
    @Transactional
    public AcademicYearResponse updateAcademicYear(Long academicYearId, AcademicYearRequest request) {
        if (academicYearId == null) {
            throw new ValidationException("Academic year ID cannot be null");
        }
        if (request == null) {
            throw new ValidationException("Academic year request cannot be null");
        }

        AcademicYear academicYear = academicYearRepository.findById(academicYearId)
                .orElseThrow(() -> new EntryNotFoundException("AcademicYear not found with ID: " + academicYearId));

        List<AcademicYear> allYears = academicYearRepository.findAll();
        boolean overlaps = allYears.stream()
                .filter(y -> !y.getAcademicYearId().equals(academicYearId))
                .anyMatch(y ->
                        (request.getStartDate().isBefore(y.getEndDate()) && request.getEndDate().isAfter(y.getStartDate()))
                );

        if (overlaps) {
            throw new com.unilearn.server.exception.IllegalStateException("Academic year date range overlaps an existing year");
        }

        academicYear.setYearLabel(request.getYearLabel());
        academicYear.setStartDate(request.getStartDate());
        academicYear.setEndDate(request.getEndDate());
        if (request.getIsCurrent() != null) {
            academicYear.setIsCurrent(request.getIsCurrent());
        }

        AcademicYear updated = academicYearRepository.save(academicYear);
        return academicYearMapper.toAcademicYearResponse(updated);
    }

    @Override
    @Transactional
    public void deleteAcademicYear(Long academicYearId) {
        if (academicYearId == null) {
            throw new ValidationException("Academic year ID cannot be null");
        }
        if (!academicYearRepository.existsById(academicYearId)) {
            throw new EntryNotFoundException("AcademicYear not found with ID: " + academicYearId);
        }
        academicYearRepository.deleteById(academicYearId);
    }

    @Override
    public AcademicYearResponse getAcademicYearById(Long academicYearId) {
        if (academicYearId == null) {
            throw new ValidationException("Academic year ID cannot be null");
        }
        AcademicYear academicYear = academicYearRepository.findById(academicYearId)
                .orElseThrow(() -> new EntryNotFoundException("AcademicYear not found with ID: " + academicYearId));
        return academicYearMapper.toAcademicYearResponse(academicYear);
    }

    @Override
    public PageResponseDTO<AcademicYearResponse> getAllAcademicYears(Pageable pageable) {
        if (pageable == null) {
            throw new ValidationException("Pageable parameter cannot be null");
        }
        Page<AcademicYear> page = academicYearRepository.findAll(pageable);
        List<AcademicYearResponse> content = page.getContent()
                .stream()
                .map(academicYearMapper::toAcademicYearResponse)
                .toList();

        return PageResponseDTO.<AcademicYearResponse>builder()
                .dataCount((int) page.getTotalElements())
                .dataList(content)
                .build();
    }

    @Override
    @Transactional
    public AcademicYearResponse setCurrentAcademicYear(Long academicYearId) {
        if (academicYearId == null) {
            throw new ValidationException("Academic year ID cannot be null");
        }

        AcademicYear target = academicYearRepository.findById(academicYearId)
                .orElseThrow(() -> new EntryNotFoundException("AcademicYear not found with ID: " + academicYearId));

        List<AcademicYear> allYears = academicYearRepository.findAll();
        for (AcademicYear year : allYears) {
            if (Boolean.TRUE.equals(year.getIsCurrent()) && !year.getAcademicYearId().equals(academicYearId)) {
                year.setIsCurrent(false);
                academicYearRepository.save(year);
            }
        }

        target.setIsCurrent(true);
        AcademicYear updated = academicYearRepository.save(target);
        return academicYearMapper.toAcademicYearResponse(updated);
    }
}
