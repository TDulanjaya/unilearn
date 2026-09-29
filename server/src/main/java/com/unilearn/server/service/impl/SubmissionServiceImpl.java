package com.unilearn.server.service.impl;

import com.unilearn.server.dto.request.submission.SubmissionCreateRequestDTO;
import com.unilearn.server.dto.request.submission.SubmissionGradeRequestDTO;
import com.unilearn.server.dto.response.SubmissionResponse;
import com.unilearn.server.exception.EntryNotFoundException;
import com.unilearn.server.exception.ValidationException;
import com.unilearn.server.model.Assignment;
import com.unilearn.server.model.Lecturer;
import com.unilearn.server.model.Student;
import com.unilearn.server.model.Submission;
import com.unilearn.server.repository.AssignmentRepository;
import com.unilearn.server.repository.LecturerRepository;
import com.unilearn.server.repository.StudentRepository;
import com.unilearn.server.repository.SubmissionRepository;
import com.unilearn.server.service.SubmissionService;
import com.unilearn.server.util.mapper.SubmissionMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class SubmissionServiceImpl implements SubmissionService {

    private final SubmissionRepository submissionRepository;
    private final AssignmentRepository assignmentRepository;
    private final StudentRepository studentRepository;
    private final LecturerRepository lecturerRepository;
    private final SubmissionMapper submissionMapper;
    private final com.unilearn.server.security.OwnershipValidator ownershipValidator;

    @Override
    @Transactional
    public SubmissionResponse submitAssignment(SubmissionCreateRequestDTO request) {
        if (request == null) {
            throw new ValidationException("Submission request cannot be null");
        }
        ownershipValidator.checkStudentOwnership(request.getStudentId());

        Assignment assignment = assignmentRepository.findById(request.getAssignmentId())
                .orElseThrow(() -> new EntryNotFoundException("Assignment not found with ID: " + request.getAssignmentId()));

        Student student = studentRepository.findById(request.getStudentId())
                .orElseThrow(() -> new EntryNotFoundException("Student not found with ID: " + request.getStudentId()));

        boolean isLate = LocalDateTime.now().isAfter(assignment.getDeadline());

        Optional<Submission> existingOpt = submissionRepository.findByAssignment_AssignmentIdAndStudent_StudentId(request.getAssignmentId(), request.getStudentId());

        Submission submission;
        if (existingOpt.isPresent()) {
            if (Boolean.FALSE.equals(assignment.getAllowResubmission())) {
                throw new com.unilearn.server.exception.IllegalStateException("Resubmission is not allowed for this assignment");
            }
            submission = existingOpt.get();
            submission.setFileUrl(request.getFileUrl());
            submission.setSubmittedAt(LocalDateTime.now());
            submission.setIsResubmission(true);
            submission.setIsLate(isLate);
        } else {
            submission = submissionMapper.toSubmission(request, assignment, student, isLate, false);
        }

        Submission saved = submissionRepository.save(submission);
        return submissionMapper.toSubmissionResponse(saved);
    }

    @Override
    @Transactional
    public SubmissionResponse gradeSubmission(Long submissionId, SubmissionGradeRequestDTO gradeRequest) {
        if (submissionId == null) {
            throw new ValidationException("Submission ID cannot be null");
        }
        if (gradeRequest == null) {
            throw new ValidationException("Grade request cannot be null");
        }
        if (gradeRequest.getGrade() == null) {
            throw new ValidationException("Score cannot be null");
        }

        Submission submission = submissionRepository.findById(submissionId)
                .orElseThrow(() -> new EntryNotFoundException("Submission not found with ID: " + submissionId));

        if (submission.getAssignment() != null && submission.getAssignment().getCourseOffering() != null) {
            ownershipValidator.checkLecturerOfferingAccess(submission.getAssignment().getCourseOffering().getOfferingId());
        }

        BigDecimal maxScore = submission.getAssignment().getMaxScore();
        if (gradeRequest.getGrade().compareTo(BigDecimal.ZERO) < 0 || gradeRequest.getGrade().compareTo(maxScore) > 0) {
            throw new ValidationException("Score cannot exceed maximum score of " + maxScore);
        }

        submission.setGrade(gradeRequest.getGrade());
        submission.setFeedback(gradeRequest.getFeedback());
        submission.setGradedAt(LocalDateTime.now());

        Submission updated = submissionRepository.save(submission);
        return submissionMapper.toSubmissionResponse(updated);
    }

    @Override
    public List<SubmissionResponse> getSubmissionsByAssignment(Long assignmentId) {
        if (assignmentId == null) {
            throw new ValidationException("Assignment ID cannot be null");
        }
        Assignment assignment = assignmentRepository.findById(assignmentId)
                .orElseThrow(() -> new EntryNotFoundException("Assignment not found with ID: " + assignmentId));

        if (assignment.getCourseOffering() != null) {
            ownershipValidator.checkLecturerOfferingAccess(assignment.getCourseOffering().getOfferingId());
        }

        return submissionRepository.findByAssignment_AssignmentId(assignmentId)
                .stream()
                .map(submissionMapper::toSubmissionResponse)
                .toList();
    }

    @Override
    public List<SubmissionResponse> getSubmissionsByStudent(Long studentId) {
        if (studentId == null) {
            throw new ValidationException("Student ID cannot be null");
        }
        ownershipValidator.checkStudentOwnership(studentId);

        if (!studentRepository.existsById(studentId)) {
            throw new EntryNotFoundException("Student not found with ID: " + studentId);
        }

        return submissionRepository.findByStudent_StudentId(studentId)
                .stream()
                .map(submissionMapper::toSubmissionResponse)
                .toList();
    }
}
