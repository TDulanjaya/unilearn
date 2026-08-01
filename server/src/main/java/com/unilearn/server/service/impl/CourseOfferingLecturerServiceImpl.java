package com.unilearn.server.service.impl;

import com.unilearn.server.dto.request.CourseOfferingLecturerRequest;
import com.unilearn.server.dto.response.CourseOfferingLecturerResponse;
import com.unilearn.server.dto.response.CourseOfferingResponse;
import com.unilearn.server.dto.response.LecturerResponse;
import com.unilearn.server.exception.EntryNotFoundException;
import com.unilearn.server.exception.ValidationException;
import com.unilearn.server.model.CourseOffering;
import com.unilearn.server.model.CourseOfferingLecturer;
import com.unilearn.server.model.CourseOfferingLecturer.CourseOfferingLecturerId;
import com.unilearn.server.model.Lecturer;
import com.unilearn.server.repository.CourseOfferingLecturerRepository;
import com.unilearn.server.repository.CourseOfferingRepository;
import com.unilearn.server.repository.LecturerRepository;
import com.unilearn.server.service.CourseOfferingLecturerService;
import com.unilearn.server.util.mapper.CourseOfferingLecturerMapper;
import com.unilearn.server.util.mapper.CourseOfferingMapper;
import com.unilearn.server.util.mapper.LecturerMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class CourseOfferingLecturerServiceImpl implements CourseOfferingLecturerService {

    private final CourseOfferingLecturerRepository courseOfferingLecturerRepository;
    private final CourseOfferingRepository courseOfferingRepository;
    private final LecturerRepository lecturerRepository;
    private final CourseOfferingLecturerMapper courseOfferingLecturerMapper;
    private final LecturerMapper lecturerMapper;
    private final CourseOfferingMapper courseOfferingMapper;

    @Override
    @Transactional
    public CourseOfferingLecturerResponse assignLecturer(CourseOfferingLecturerRequest request) {
        if (request == null) {
            throw new ValidationException("Course offering lecturer request cannot be null");
        }

        CourseOffering offering = courseOfferingRepository.findById(request.getOfferingId())
                .orElseThrow(() -> new EntryNotFoundException("CourseOffering not found with ID: " + request.getOfferingId()));

        Lecturer lecturer = lecturerRepository.findById(request.getLecturerId())
                .orElseThrow(() -> new EntryNotFoundException("Lecturer not found with ID: " + request.getLecturerId()));

        CourseOfferingLecturerId id = new CourseOfferingLecturerId(request.getOfferingId(), request.getLecturerId());
        if (courseOfferingLecturerRepository.existsById(id)) {
            throw new com.unilearn.server.exception.DuplicateEntryException("Lecturer already assigned to this offering");
        }

        CourseOfferingLecturer col = courseOfferingLecturerMapper.toCourseOfferingLecturer(offering, lecturer);
        CourseOfferingLecturer saved = courseOfferingLecturerRepository.save(col);
        return courseOfferingLecturerMapper.toCourseOfferingLecturerResponse(saved);
    }

    @Override
    @Transactional
    public void removeLecturer(Long offeringId, Long lecturerId) {
        if (offeringId == null || lecturerId == null) {
            throw new ValidationException("Offering ID and Lecturer ID cannot be null");
        }

        CourseOfferingLecturerId id = new CourseOfferingLecturerId(offeringId, lecturerId);
        if (!courseOfferingLecturerRepository.existsById(id)) {
            throw new EntryNotFoundException("CourseOfferingLecturer assignment not found");
        }

        courseOfferingLecturerRepository.deleteById(id);
    }

    @Override
    public List<LecturerResponse> getLecturersForOffering(Long offeringId) {
        if (offeringId == null) {
            throw new ValidationException("Offering ID cannot be null");
        }
        if (!courseOfferingRepository.existsById(offeringId)) {
            throw new EntryNotFoundException("CourseOffering not found with ID: " + offeringId);
        }

        return courseOfferingLecturerRepository.findByCourseOffering_OfferingId(offeringId)
                .stream()
                .map(col -> lecturerMapper.toLecturerResponse(col.getLecturer()))
                .toList();
    }

    @Override
    public List<CourseOfferingResponse> getOfferingsForLecturer(Long lecturerId) {
        if (lecturerId == null) {
            throw new ValidationException("Lecturer ID cannot be null");
        }
        if (!lecturerRepository.existsById(lecturerId)) {
            throw new EntryNotFoundException("Lecturer not found with ID: " + lecturerId);
        }

        return courseOfferingLecturerRepository.findByLecturer_LecturerId(lecturerId)
                .stream()
                .map(col -> courseOfferingMapper.toCourseOfferingResponse(col.getCourseOffering()))
                .toList();
    }
}
