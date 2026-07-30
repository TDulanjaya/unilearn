package com.unilearn.server.service.impl;

import com.unilearn.server.dto.request.GradebookEntryRequest;
import com.unilearn.server.dto.response.GradebookEntryResponse;
import com.unilearn.server.exception.EntryNotFoundException;
import com.unilearn.server.exception.ValidationException;
import com.unilearn.server.model.CourseOffering;
import com.unilearn.server.model.GradebookEntry;
import com.unilearn.server.model.Student;
import com.unilearn.server.repository.CourseOfferingRepository;
import com.unilearn.server.repository.GradebookEntryRepository;
import com.unilearn.server.repository.StudentRepository;
import com.unilearn.server.service.GradebookEntryService;
import com.unilearn.server.util.GradebookEntryMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class GradebookEntryServiceImpl implements GradebookEntryService {

    private final GradebookEntryRepository gradebookEntryRepository;
    private final CourseOfferingRepository courseOfferingRepository;
    private final StudentRepository studentRepository;
    private final GradebookEntryMapper gradebookEntryMapper;

    @Override
    @Transactional
    public GradebookEntryResponse createGradebookEntry(GradebookEntryRequest request) {
        if (request == null) {
            throw new ValidationException("GradebookEntry request cannot be null");
        }

        CourseOffering offering = courseOfferingRepository.findById(request.getOfferingId())
                .orElseThrow(() -> new EntryNotFoundException("CourseOffering not found with ID: " + request.getOfferingId()));

        Student student = studentRepository.findById(request.getStudentId())
                .orElseThrow(() -> new EntryNotFoundException("Student not found with ID: " + request.getStudentId()));

        GradebookEntry entry = gradebookEntryMapper.toGradebookEntry(request, offering, student);
        GradebookEntry saved = gradebookEntryRepository.save(entry);
        return gradebookEntryMapper.toGradebookEntryResponse(saved);
    }

    @Override
    @Transactional
    public GradebookEntryResponse updateGradebookEntry(Long entryId, GradebookEntryRequest request) {
        if (entryId == null) {
            throw new ValidationException("Gradebook entry ID cannot be null");
        }
        if (request == null) {
            throw new ValidationException("GradebookEntry request cannot be null");
        }

        GradebookEntry entry = gradebookEntryRepository.findById(entryId)
                .orElseThrow(() -> new EntryNotFoundException("GradebookEntry not found with ID: " + entryId));

        CourseOffering offering = courseOfferingRepository.findById(request.getOfferingId())
                .orElseThrow(() -> new EntryNotFoundException("CourseOffering not found with ID: " + request.getOfferingId()));

        Student student = studentRepository.findById(request.getStudentId())
                .orElseThrow(() -> new EntryNotFoundException("Student not found with ID: " + request.getStudentId()));

        entry.setCourseOffering(offering);
        entry.setStudent(student);
        entry.setComponent(request.getComponent());
        entry.setComponentRefId(request.getComponentRefId());
        entry.setWeightPct(request.getWeightPct());
        entry.setScore(request.getScore());

        GradebookEntry updated = gradebookEntryRepository.save(entry);
        return gradebookEntryMapper.toGradebookEntryResponse(updated);
    }

    @Override
    @Transactional
    public void deleteGradebookEntry(Long entryId) {
        if (entryId == null) {
            throw new ValidationException("Gradebook entry ID cannot be null");
        }
        if (!gradebookEntryRepository.existsById(entryId)) {
            throw new EntryNotFoundException("GradebookEntry not found with ID: " + entryId);
        }
        gradebookEntryRepository.deleteById(entryId);
    }

    @Override
    public GradebookEntryResponse getEntryById(Long entryId) {
        if (entryId == null) {
            throw new ValidationException("Gradebook entry ID cannot be null");
        }
        GradebookEntry entry = gradebookEntryRepository.findById(entryId)
                .orElseThrow(() -> new EntryNotFoundException("GradebookEntry not found with ID: " + entryId));
        return gradebookEntryMapper.toGradebookEntryResponse(entry);
    }

    @Override
    public List<GradebookEntryResponse> getEntriesByOffering(Long offeringId) {
        if (offeringId == null) {
            throw new ValidationException("Offering ID cannot be null");
        }
        if (!courseOfferingRepository.existsById(offeringId)) {
            throw new EntryNotFoundException("CourseOffering not found with ID: " + offeringId);
        }

        return gradebookEntryRepository.findByCourseOffering_OfferingId(offeringId)
                .stream()
                .map(gradebookEntryMapper::toGradebookEntryResponse)
                .toList();
    }

    @Override
    public List<GradebookEntryResponse> getEntriesByStudent(Long studentId) {
        if (studentId == null) {
            throw new ValidationException("Student ID cannot be null");
        }
        if (!studentRepository.existsById(studentId)) {
            throw new EntryNotFoundException("Student not found with ID: " + studentId);
        }

        return gradebookEntryRepository.findByStudent_StudentId(studentId)
                .stream()
                .map(gradebookEntryMapper::toGradebookEntryResponse)
                .toList();
    }
}
