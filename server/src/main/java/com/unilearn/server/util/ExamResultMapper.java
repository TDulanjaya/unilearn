package com.unilearn.server.util;

import com.unilearn.server.dto.request.ExamResultRequest;
import com.unilearn.server.dto.response.ExamResultResponse;
import com.unilearn.server.exception.ValidationException;
import com.unilearn.server.model.Exam;
import com.unilearn.server.model.ExamResult;
import com.unilearn.server.model.Student;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Component
public class ExamResultMapper {

    public ExamResult toExamResult(ExamResultRequest request, Exam exam, Student student) {
        if (request == null) {
            throw new ValidationException("ExamResult request cannot be null");
        }
        return ExamResult.builder()
                .exam(exam)
                .student(student)
                .score(request.getScore())
                .grade(request.getGrade())
                .publishedAt(LocalDateTime.now())
                .build();
    }

    public ExamResultResponse toExamResultResponse(ExamResult result) {
        if (result == null) {
            throw new ValidationException("ExamResult cannot be null");
        }
        return ExamResultResponse.builder()
                .resultId(result.getResultId())
                .examId(result.getExam() != null ? result.getExam().getExamId() : null)
                .studentId(result.getStudent() != null ? result.getStudent().getStudentId() : null)
                .studentName(result.getStudent() != null && result.getStudent().getUser() != null ? result.getStudent().getUser().getFullName() : null)
                .totalScore(result.getScore())
                .score(result.getScore())
                .grade(result.getGrade())
                .publishedAt(result.getPublishedAt())
                .build();
    }
}
