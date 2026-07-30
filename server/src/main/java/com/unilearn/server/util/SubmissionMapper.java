package com.unilearn.server.util;

import com.unilearn.server.dto.request.SubmissionRequest;
import com.unilearn.server.dto.response.SubmissionResponse;
import com.unilearn.server.exception.ValidationException;
import com.unilearn.server.model.Assignment;
import com.unilearn.server.model.Student;
import com.unilearn.server.model.Submission;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Component
public class SubmissionMapper {

    public Submission toSubmission(SubmissionRequest request, Assignment assignment, Student student, boolean isLate, boolean isResubmission) {
        if (request == null) {
            throw new ValidationException("Submission request cannot be null");
        }
        return Submission.builder()
                .assignment(assignment)
                .student(student)
                .fileUrl(request.getFileUrl())
                .submittedAt(LocalDateTime.now())
                .isLate(isLate)
                .isResubmission(isResubmission)
                .build();
    }

    public SubmissionResponse toSubmissionResponse(Submission submission) {
        if (submission == null) {
            throw new ValidationException("Submission cannot be null");
        }
        return SubmissionResponse.builder()
                .submissionId(submission.getSubmissionId())
                .assignmentId(submission.getAssignment() != null ? submission.getAssignment().getAssignmentId() : null)
                .studentId(submission.getStudent() != null ? submission.getStudent().getStudentId() : null)
                .studentName(submission.getStudent() != null && submission.getStudent().getUser() != null ? submission.getStudent().getUser().getFullName() : null)
                .fileUrl(submission.getFileUrl())
                .submittedAt(submission.getSubmittedAt())
                .isResubmission(submission.getIsResubmission())
                .isLate(submission.getIsLate())
                .score(submission.getGrade())
                .grade(submission.getGrade())
                .feedback(submission.getFeedback())
                .gradedById(submission.getGradedBy() != null ? submission.getGradedBy().getLecturerId() : null)
                .gradedByName(submission.getGradedBy() != null && submission.getGradedBy().getUser() != null ? submission.getGradedBy().getUser().getFullName() : null)
                .gradedAt(submission.getGradedAt())
                .build();
    }
}
