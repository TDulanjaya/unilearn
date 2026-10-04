package com.unilearn.server.service.impl;

import com.unilearn.server.dto.request.ExamResultRequest;
import com.unilearn.server.dto.response.ExamResultResponse;
import com.unilearn.server.exception.EntryNotFoundException;
import com.unilearn.server.exception.ValidationException;
import com.unilearn.server.model.Exam;
import com.unilearn.server.model.ExamAnswer;
import com.unilearn.server.model.ExamAttempt;
import com.unilearn.server.model.ExamResult;
import com.unilearn.server.model.Student;
import com.unilearn.server.repository.ExamAnswerRepository;
import com.unilearn.server.repository.ExamAttemptRepository;
import com.unilearn.server.repository.ExamRepository;
import com.unilearn.server.repository.ExamResultRepository;
import com.unilearn.server.repository.StudentRepository;
import com.unilearn.server.service.ExamResultService;
import com.unilearn.server.util.mapper.ExamResultMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ExamResultServiceImpl implements ExamResultService {

    private final ExamResultRepository examResultRepository;
    private final ExamRepository examRepository;
    private final StudentRepository studentRepository;
    private final ExamAttemptRepository examAttemptRepository;
    private final ExamAnswerRepository examAnswerRepository;
    private final ExamResultMapper examResultMapper;
    private final com.unilearn.server.security.OwnershipValidator ownershipValidator;
    private final com.unilearn.server.repository.ExamQuestionRepository examQuestionRepository;

    @Override
    @Transactional
    public ExamResultResponse publishResult(ExamResultRequest request) {
        if (request == null) {
            throw new ValidationException("ExamResult request cannot be null");
        }

        Exam exam = examRepository.findById(request.getExamId())
                .orElseThrow(() -> new EntryNotFoundException("Exam not found with ID: " + request.getExamId()));

        if (exam.getCourseOffering() != null) {
            ownershipValidator.checkLecturerOfferingAccess(exam.getCourseOffering().getOfferingId());
        }

        Student student = studentRepository.findById(request.getStudentId())
                .orElseThrow(() -> new EntryNotFoundException("Student not found with ID: " + request.getStudentId()));

        ExamResult result = examResultRepository.findByExam_ExamIdAndStudent_StudentId(request.getExamId(), request.getStudentId())
                .orElseGet(() -> examResultMapper.toExamResult(request, exam, student));

        result.setScore(request.getScore());
        result.setGrade(request.getGrade());
        result.setPublishedAt(LocalDateTime.now());

        ExamResult saved = examResultRepository.save(result);
        return examResultMapper.toExamResultResponse(saved);
    }

    @Override
    @Transactional
    public ExamResultResponse publishResultForStudent(Long examId, Long studentId) {
        return saveResult(examId, studentId, true);
    }

    @Override
    @Transactional
    public ExamResultResponse computeResultForStudent(Long examId, Long studentId) {
        return saveResult(examId, studentId, false);
    }

    // letter grade from the % of the exam's total marks (null if the exam has no questions)
    private String letterGrade(Long examId, BigDecimal score) {
        BigDecimal total = examQuestionRepository.findByExam_ExamId(examId).stream()
                .map(eq -> examQuestionRepository.maxMarksFor(examId, eq.getQuestion()))
                .filter(java.util.Objects::nonNull)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        if (score == null || total.signum() <= 0) {
            return null;
        }
        double pct = score.doubleValue() * 100.0 / total.doubleValue();
        if (pct >= 85) return "A+";
        if (pct >= 75) return "A";
        if (pct >= 70) return "A-";
        if (pct >= 65) return "B+";
        if (pct >= 60) return "B";
        if (pct >= 55) return "B-";
        if (pct >= 50) return "C+";
        if (pct >= 45) return "C";
        if (pct >= 40) return "C-";
        if (pct >= 35) return "D+";
        if (pct >= 30) return "D";
        return "F";
    }

    private ExamResultResponse saveResult(Long examId, Long studentId, boolean publish) {
        if (examId == null || studentId == null) {
            throw new ValidationException("Exam ID and Student ID cannot be null");
        }

        Exam exam = examRepository.findById(examId)
                .orElseThrow(() -> new EntryNotFoundException("Exam not found with ID: " + examId));

        if (exam.getCourseOffering() != null) {
            ownershipValidator.checkLecturerOfferingAccess(exam.getCourseOffering().getOfferingId());
        }

        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new EntryNotFoundException("Student not found with ID: " + studentId));

        ExamAttempt attempt = examAttemptRepository.findByExam_ExamIdAndStudent_StudentId(examId, studentId)
                .orElseThrow(() -> new EntryNotFoundException("ExamAttempt not found for exam ID: " + examId + " and student ID: " + studentId));

        // count each question once, even if it was saved twice
        List<ExamAnswer> answers = ExamAttemptServiceImpl.latestPerQuestion(
                examAnswerRepository.findByAttempt_AttemptId(attempt.getAttemptId()));
        BigDecimal totalScore = answers.stream()
                .map(a -> a.getMarksAwarded() != null ? a.getMarksAwarded() : BigDecimal.ZERO)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        ExamResult result = examResultRepository.findByExam_ExamIdAndStudent_StudentId(examId, studentId)
                .orElseGet(() -> ExamResult.builder().exam(exam).student(student).build());

        result.setScore(totalScore);
        result.setGrade(letterGrade(examId, totalScore));
        if (publish) {
            result.setPublishedAt(LocalDateTime.now());
        }

        ExamResult saved = examResultRepository.save(result);
        return examResultMapper.toExamResultResponse(saved);
    }

    @Override
    @Transactional
    public List<ExamResultResponse> publishAllResultsForExam(Long examId) {
        if (examId == null) {
            throw new ValidationException("Exam ID cannot be null");
        }

        Exam exam = examRepository.findById(examId)
                .orElseThrow(() -> new EntryNotFoundException("Exam not found with ID: " + examId));

        if (exam.getCourseOffering() != null) {
            ownershipValidator.checkLecturerOfferingAccess(exam.getCourseOffering().getOfferingId());
        }

        List<ExamAttempt> attempts = examAttemptRepository.findByExam_ExamId(examId);
        List<ExamResultResponse> responses = new ArrayList<>();

        for (ExamAttempt attempt : attempts) {
            if (attempt.getStudent() != null) {
                ExamResultResponse res = publishResultForStudent(examId, attempt.getStudent().getStudentId());
                responses.add(res);
            }
        }

        return responses;
    }

    @Override
    public ExamResultResponse getResultForStudent(Long examId, Long studentId) {
        if (examId == null || studentId == null) {
            throw new ValidationException("Exam ID and Student ID cannot be null");
        }
        ownershipValidator.checkStudentOwnership(studentId);

        ExamResult result = examResultRepository.findByExam_ExamIdAndStudent_StudentId(examId, studentId)
                .orElseThrow(() -> new EntryNotFoundException("ExamResult not found for exam ID: " + examId + " and student ID: " + studentId));

        if (ownershipValidator.isStudent() && result.getPublishedAt() == null) {
            throw new org.springframework.security.access.AccessDeniedException("Exam results have not been published yet.");
        }

        return examResultMapper.toExamResultResponse(result);
    }

    @Override
    public List<ExamResultResponse> getResultsForExam(Long examId) {
        if (examId == null) {
            throw new ValidationException("Exam ID cannot be null");
        }
        Exam exam = examRepository.findById(examId)
                .orElseThrow(() -> new EntryNotFoundException("Exam not found with ID: " + examId));

        if (exam.getCourseOffering() != null) {
            ownershipValidator.checkLecturerOfferingAccess(exam.getCourseOffering().getOfferingId());
        }

        return examResultRepository.findByExam_ExamId(examId)
                .stream()
                .map(examResultMapper::toExamResultResponse)
                .toList();
    }
}
