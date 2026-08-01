package com.unilearn.server.service.impl;

import com.unilearn.server.dto.request.AssignmentRequest;
import com.unilearn.server.dto.response.AssignmentResponse;
import com.unilearn.server.exception.EntryNotFoundException;
import com.unilearn.server.exception.ValidationException;
import com.unilearn.server.model.Assignment;
import com.unilearn.server.model.CourseOffering;
import com.unilearn.server.model.Lecturer;
import com.unilearn.server.repository.AssignmentRepository;
import com.unilearn.server.repository.CourseOfferingRepository;
import com.unilearn.server.repository.LecturerRepository;
import com.unilearn.server.service.AssignmentService;
import com.unilearn.server.util.mapper.AssignmentMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AssignmentServiceImpl implements AssignmentService {

    private final AssignmentRepository assignmentRepository;
    private final CourseOfferingRepository courseOfferingRepository;
    private final LecturerRepository lecturerRepository;
    private final AssignmentMapper assignmentMapper;

    @Override
    @Transactional
    public AssignmentResponse createAssignment(AssignmentRequest request) {
        if (request == null) {
            throw new ValidationException("Assignment request cannot be null");
        }

        if (request.getDeadline() != null && request.getDeadline().isBefore(LocalDateTime.now())) {
            throw new com.unilearn.server.exception.IllegalStateException("Due date cannot be in the past or before the publish date");
        }

        CourseOffering offering = courseOfferingRepository.findById(request.getOfferingId())
                .orElseThrow(() -> new EntryNotFoundException("CourseOffering not found with ID: " + request.getOfferingId()));

        Lecturer lecturer = lecturerRepository.findById(request.getCreatedById())
                .orElseThrow(() -> new EntryNotFoundException("Lecturer not found with ID: " + request.getCreatedById()));

        Assignment assignment = assignmentMapper.toAssignment(request, offering, lecturer);
        Assignment saved = assignmentRepository.save(assignment);
        return assignmentMapper.toAssignmentResponse(saved);
    }

    @Override
    @Transactional
    public AssignmentResponse updateAssignment(Long assignmentId, AssignmentRequest request) {
        if (assignmentId == null) {
            throw new ValidationException("Assignment ID cannot be null");
        }
        if (request == null) {
            throw new ValidationException("Assignment request cannot be null");
        }

        Assignment assignment = assignmentRepository.findById(assignmentId)
                .orElseThrow(() -> new EntryNotFoundException("Assignment not found with ID: " + assignmentId));

        if (request.getDeadline() != null && request.getDeadline().isBefore(LocalDateTime.now())) {
            throw new com.unilearn.server.exception.IllegalStateException("Due date cannot be in the past or before the publish date");
        }

        CourseOffering offering = courseOfferingRepository.findById(request.getOfferingId())
                .orElseThrow(() -> new EntryNotFoundException("CourseOffering not found with ID: " + request.getOfferingId()));

        Lecturer lecturer = lecturerRepository.findById(request.getCreatedById())
                .orElseThrow(() -> new EntryNotFoundException("Lecturer not found with ID: " + request.getCreatedById()));

        assignment.setCourseOffering(offering);
        assignment.setTitle(request.getTitle());
        assignment.setDescription(request.getDescription());
        assignment.setDeadline(request.getDeadline());
        assignment.setMaxScore(request.getMaxScore());
        if (request.getAllowResubmission() != null) {
            assignment.setAllowResubmission(request.getAllowResubmission());
        }
        assignment.setCreatedBy(lecturer);

        Assignment updated = assignmentRepository.save(assignment);
        return assignmentMapper.toAssignmentResponse(updated);
    }

    @Override
    @Transactional
    public void deleteAssignment(Long assignmentId) {
        if (assignmentId == null) {
            throw new ValidationException("Assignment ID cannot be null");
        }
        if (!assignmentRepository.existsById(assignmentId)) {
            throw new EntryNotFoundException("Assignment not found with ID: " + assignmentId);
        }
        assignmentRepository.deleteById(assignmentId);
    }

    @Override
    public AssignmentResponse getAssignmentById(Long assignmentId) {
        if (assignmentId == null) {
            throw new ValidationException("Assignment ID cannot be null");
        }
        Assignment assignment = assignmentRepository.findById(assignmentId)
                .orElseThrow(() -> new EntryNotFoundException("Assignment not found with ID: " + assignmentId));
        return assignmentMapper.toAssignmentResponse(assignment);
    }

    @Override
    public List<AssignmentResponse> getAssignmentsByOffering(Long offeringId) {
        if (offeringId == null) {
            throw new ValidationException("Offering ID cannot be null");
        }
        if (!courseOfferingRepository.existsById(offeringId)) {
            throw new EntryNotFoundException("CourseOffering not found with ID: " + offeringId);
        }

        return assignmentRepository.findByCourseOffering_OfferingId(offeringId)
                .stream()
                .map(assignmentMapper::toAssignmentResponse)
                .toList();
    }
}
