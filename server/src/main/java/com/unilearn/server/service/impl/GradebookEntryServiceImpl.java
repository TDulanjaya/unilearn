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
import com.unilearn.server.util.mapper.GradebookEntryMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class GradebookEntryServiceImpl implements GradebookEntryService {

    private final GradebookEntryRepository gradebookEntryRepository;
    private final CourseOfferingRepository courseOfferingRepository;
    private final StudentRepository studentRepository;
    private final GradebookEntryMapper gradebookEntryMapper;
    private final com.unilearn.server.security.OwnershipValidator ownershipValidator;

    @Override
    @Transactional
    public GradebookEntryResponse createGradebookEntry(GradebookEntryRequest request) {
        if (request == null) {
            throw new ValidationException("GradebookEntry request cannot be null");
        }
        ownershipValidator.checkLecturerOfferingAccess(request.getOfferingId());

        CourseOffering offering = courseOfferingRepository.findById(request.getOfferingId())
                .orElseThrow(() -> new EntryNotFoundException("CourseOffering not found with ID: " + request.getOfferingId()));

        Student student = studentRepository.findById(request.getStudentId())
                .orElseThrow(() -> new EntryNotFoundException("Student not found with ID: " + request.getStudentId()));

        // old rows are updated, not added again
        Optional<GradebookEntry> existing = request.getComponentRefId() != null
                ? gradebookEntryRepository.findFirstByCourseOffering_OfferingIdAndStudent_StudentIdAndComponentAndComponentRefId(
                        request.getOfferingId(), request.getStudentId(), request.getComponent(), request.getComponentRefId())
                : gradebookEntryRepository.findFirstByCourseOffering_OfferingIdAndStudent_StudentIdAndComponentAndComponentRefIdIsNull(
                        request.getOfferingId(), request.getStudentId(), request.getComponent());

        GradebookEntry entry;
        if (existing.isPresent()) {
            entry = existing.get();
            entry.setWeightPct(request.getWeightPct());
            entry.setScore(request.getScore());
        } else {
            entry = gradebookEntryMapper.toGradebookEntry(request, offering, student);
        }
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

        if (entry.getCourseOffering() != null) {
            ownershipValidator.checkLecturerOfferingAccess(entry.getCourseOffering().getOfferingId());
        }
        ownershipValidator.checkLecturerOfferingAccess(request.getOfferingId());

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
        GradebookEntry entry = gradebookEntryRepository.findById(entryId)
                .orElseThrow(() -> new EntryNotFoundException("GradebookEntry not found with ID: " + entryId));

        if (entry.getCourseOffering() != null) {
            ownershipValidator.checkLecturerOfferingAccess(entry.getCourseOffering().getOfferingId());
        }

        gradebookEntryRepository.delete(entry);
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
        ownershipValidator.checkLecturerOfferingAccess(offeringId);

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
        ownershipValidator.checkStudentOwnership(studentId);

        if (!studentRepository.existsById(studentId)) {
            throw new EntryNotFoundException("Student not found with ID: " + studentId);
        }

        return gradebookEntryRepository.findByStudent_StudentId(studentId)
                .stream()
                .map(gradebookEntryMapper::toGradebookEntryResponse)
                .toList();
    }
}
