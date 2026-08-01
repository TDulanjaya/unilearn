package com.unilearn.server.util.mapper;

import com.unilearn.server.dto.request.examattempt.ExamAttemptStartRequestDTO;
import com.unilearn.server.dto.response.ExamAttemptResponse;
import com.unilearn.server.exception.ValidationException;
import com.unilearn.server.model.Exam;
import com.unilearn.server.model.ExamAttempt;
import com.unilearn.server.model.Student;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Component
public class ExamAttemptMapper {

    public ExamAttempt toExamAttempt(ExamAttemptStartRequestDTO request, Exam exam, Student student) {
        if (request == null) {
            throw new ValidationException("ExamAttempt request cannot be null");
        }
        return ExamAttempt.builder()
                .exam(exam)
                .student(student)
                .startTime(LocalDateTime.now())
                .status("in_progress")
                .build();
    }

    public ExamAttemptResponse toExamAttemptResponse(ExamAttempt attempt) {
        if (attempt == null) {
            throw new ValidationException("ExamAttempt cannot be null");
        }
        return ExamAttemptResponse.builder()
                .attemptId(attempt.getAttemptId())
                .examId(attempt.getExam() != null ? attempt.getExam().getExamId() : null)
                .studentId(attempt.getStudent() != null ? attempt.getStudent().getStudentId() : null)
                .studentName(attempt.getStudent() != null && attempt.getStudent().getUser() != null ? attempt.getStudent().getUser().getFullName() : null)
                .startedAt(attempt.getStartTime())
                .startTime(attempt.getStartTime())
                .submittedAt(attempt.getEndTime())
                .endTime(attempt.getEndTime())
                .status(attempt.getStatus())
                .build();
    }
}
