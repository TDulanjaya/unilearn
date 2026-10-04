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
    private final com.unilearn.server.security.OwnershipValidator ownershipValidator;
    private final com.unilearn.server.repository.EnrollmentRepository enrollmentRepository;

    @Override
    @Transactional
    public AssignmentResponse createAssignment(AssignmentRequest request) {
        if (request == null) {
            throw new ValidationException("Assignment request cannot be null");
        }
        ownershipValidator.checkLecturerOfferingAccess(request.getOfferingId());

        if (request.getDeadline() != null && request.getDeadline().isBefore(LocalDateTime.now())) {
            throw new com.unilearn.server.exception.IllegalStateException("Due date cannot be in the past or before the publish date");
        }

        CourseOffering offering = courseOfferingRepository.findById(request.getOfferingId())
                .orElseThrow(() -> new EntryNotFoundException("CourseOffering not found with ID: " + request.getOfferingId()));

        Lecturer lecturer = currentLecturer();
        request.setCreatedById(lecturer.getLecturerId());

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

        if (assignment.getCourseOffering() != null) {
            ownershipValidator.checkLecturerOfferingAccess(assignment.getCourseOffering().getOfferingId());
        }
        ownershipValidator.checkLecturerOfferingAccess(request.getOfferingId());

        if (request.getDeadline() != null && request.getDeadline().isBefore(LocalDateTime.now())) {
            throw new com.unilearn.server.exception.IllegalStateException("Due date cannot be in the past or before the publish date");
        }

        CourseOffering offering = courseOfferingRepository.findById(request.getOfferingId())
                .orElseThrow(() -> new EntryNotFoundException("CourseOffering not found with ID: " + request.getOfferingId()));

        // keep the original creator
        Lecturer lecturer = assignment.getCreatedBy() != null ? assignment.getCreatedBy() : currentLecturer();

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
        Assignment assignment = assignmentRepository.findById(assignmentId)
                .orElseThrow(() -> new EntryNotFoundException("Assignment not found with ID: " + assignmentId));

        if (assignment.getCourseOffering() != null) {
            ownershipValidator.checkLecturerOfferingAccess(assignment.getCourseOffering().getOfferingId());
        }

        assignmentRepository.delete(assignment);
    }

    @Override
    public AssignmentResponse getAssignmentById(Long assignmentId) {
        if (assignmentId == null) {
            throw new ValidationException("Assignment ID cannot be null");
        }
        Assignment assignment = assignmentRepository.findById(assignmentId)
                .orElseThrow(() -> new EntryNotFoundException("Assignment not found with ID: " + assignmentId));

        if (assignment.getCourseOffering() != null) {
            Long offId = assignment.getCourseOffering().getOfferingId();
            if (ownershipValidator.isLecturer()) {
                ownershipValidator.checkLecturerOfferingAccess(offId);
            } else if (ownershipValidator.isStudent()) {
                var currentUser = ownershipValidator.getCurrentUser();
                if (currentUser.isPresent() && !enrollmentRepository.existsByStudent_StudentIdAndCourseOffering_OfferingId(currentUser.get().getUserId(), offId)) {
                    throw new org.springframework.security.access.AccessDeniedException("Access denied: You are not enrolled in this course offering");
                }
            }
        }

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

        if (ownershipValidator.isLecturer()) {
            ownershipValidator.checkLecturerOfferingAccess(offeringId);
        } else if (ownershipValidator.isStudent()) {
            var currentUser = ownershipValidator.getCurrentUser();
            if (currentUser.isPresent() && !enrollmentRepository.existsByStudent_StudentIdAndCourseOffering_OfferingId(currentUser.get().getUserId(), offeringId)) {
                throw new org.springframework.security.access.AccessDeniedException("Access denied: You are not enrolled in this course offering");
            }
        }

        return assignmentRepository.findByCourseOffering_OfferingId(offeringId)
                .stream()
                .map(assignmentMapper::toAssignmentResponse)
                .toList();
    }

    // the logged in lecturer, not the id sent by the browser
    private Lecturer currentLecturer() {
        com.unilearn.server.model.User user = ownershipValidator.getCurrentUser()
                .orElseThrow(() -> new org.springframework.security.access.AccessDeniedException("User not authenticated"));
        return lecturerRepository.findById(user.getUserId())
                .orElseThrow(() -> new org.springframework.security.access.AccessDeniedException("Only lecturers can do this"));
    }
}
