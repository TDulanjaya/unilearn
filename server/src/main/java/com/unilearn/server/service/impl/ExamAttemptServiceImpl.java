package com.unilearn.server.service.impl;

import com.unilearn.server.dto.request.examattempt.ExamAttemptStartRequestDTO;
import com.unilearn.server.dto.response.ExamAttemptResponse;
import com.unilearn.server.exception.EntryNotFoundException;
import com.unilearn.server.exception.ValidationException;
import com.unilearn.server.model.Exam;
import com.unilearn.server.model.ExamAnswer;
import com.unilearn.server.model.ExamAttempt;
import com.unilearn.server.model.Question;
import com.unilearn.server.model.Student;
import com.unilearn.server.repository.ExamAttemptRepository;
import com.unilearn.server.repository.ExamRepository;
import com.unilearn.server.repository.StudentRepository;
import com.unilearn.server.service.ExamAttemptService;
import com.unilearn.server.util.mapper.ExamAttemptMapper;
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
public class ExamAttemptServiceImpl implements ExamAttemptService {

    private final ExamAttemptRepository examAttemptRepository;
    private final ExamRepository examRepository;
    private final StudentRepository studentRepository;
    private final ExamAttemptMapper examAttemptMapper;
    private final com.unilearn.server.security.OwnershipValidator ownershipValidator;
    private final com.unilearn.server.repository.EnrollmentRepository enrollmentRepository;
    private final com.unilearn.server.repository.ExamAnswerRepository examAnswerRepository;
    private final com.unilearn.server.repository.ExamQuestionRepository examQuestionRepository;

    @Override
    @Transactional
    public ExamAttemptResponse startAttempt(ExamAttemptStartRequestDTO request) {
        if (request == null) {
            throw new ValidationException("ExamAttempt request cannot be null");
        }
        ownershipValidator.checkStudentOwnership(request.getStudentId());

        Exam exam = examRepository.findById(request.getExamId())
                .orElseThrow(() -> new EntryNotFoundException("Exam not found with ID: " + request.getExamId()));

        Student student = studentRepository.findById(request.getStudentId())
                .orElseThrow(() -> new EntryNotFoundException("Student not found with ID: " + request.getStudentId()));

        Optional<ExamAttempt> existingOpt = examAttemptRepository.findByExam_ExamIdAndStudent_StudentId(request.getExamId(), request.getStudentId());
        if (existingOpt.isPresent()) {
            ExamAttempt existing = existingOpt.get();
            if ("submitted".equalsIgnoreCase(existing.getStatus()) || existing.getEndTime() != null) {
                throw new com.unilearn.server.exception.DuplicateEntryException("You have already submitted this exam");
            }
            return examAttemptMapper.toExamAttemptResponse(existing);
        }

        // student must be enrolled in the course offering
        Long offeringId = exam.getCourseOffering() != null ? exam.getCourseOffering().getOfferingId() : null;
        if (offeringId == null || !enrollmentRepository.existsByStudent_StudentIdAndCourseOffering_OfferingId(student.getStudentId(), offeringId)) {
            throw new org.springframework.security.access.AccessDeniedException("Access denied: You are not enrolled in this course offering");
        }

        if (exam.getStatus() != null && !"published".equalsIgnoreCase(exam.getStatus())) {
            throw new com.unilearn.server.exception.IllegalStateException("This exam is not open (status: " + exam.getStatus() + ")");
        }

        // check the exam time window
        LocalDateTime now = LocalDateTime.now();
        if (exam.getExamDate() != null && exam.getStartTime() != null) {
            LocalDateTime examStart = exam.getExamDate().atTime(exam.getStartTime());
            if (now.isBefore(examStart)) {
                throw new com.unilearn.server.exception.IllegalStateException("Exam has not started yet. It starts at " + examStart.toLocalDate() + " " + examStart.toLocalTime() + ".");
            }
            if (exam.getEndTime() != null) {
                LocalDateTime examEnd = exam.getExamDate().atTime(exam.getEndTime());
                // end time on the next day (for late exams)
                if (!examEnd.isAfter(examStart)) {
                    examEnd = examEnd.plusDays(1);
                }
                if (now.isAfter(examEnd)) {
                    throw new com.unilearn.server.exception.IllegalStateException("This exam has already ended.");
                }
            }
        }

        ExamAttempt attempt = examAttemptMapper.toExamAttempt(request, exam, student);
        ExamAttempt saved = examAttemptRepository.save(attempt);
        return examAttemptMapper.toExamAttemptResponse(saved);
    }

    @Override
    @Transactional
    public ExamAttemptResponse submitAttempt(Long attemptId, Long studentId) {
        if (attemptId == null) {
            throw new ValidationException("Attempt ID cannot be null");
        }

        ExamAttempt attempt = examAttemptRepository.findById(attemptId)
                .orElseThrow(() -> new EntryNotFoundException("ExamAttempt not found with ID: " + attemptId));

        if (attempt.getStudent() != null) {
            ownershipValidator.checkStudentOwnership(attempt.getStudent().getStudentId());
        }

        if ("submitted".equalsIgnoreCase(attempt.getStatus())) {
            throw new com.unilearn.server.exception.IllegalStateException("Exam attempt is already submitted");
        }

        // mark objective answers now, essays are left for the lecturer
        autoMarkAnswers(attempt);

        attempt.setEndTime(LocalDateTime.now());
        attempt.setStatus("submitted");

        ExamAttempt updated = examAttemptRepository.save(attempt);
        return examAttemptMapper.toExamAttemptResponse(updated);
    }

    private void autoMarkAnswers(ExamAttempt attempt) {
        Long examId = attempt.getExam() != null ? attempt.getExam().getExamId() : null;
        List<ExamAnswer> answers = latestPerQuestion(examAnswerRepository.findByAttempt_AttemptId(attempt.getAttemptId()));
        for (ExamAnswer answer : answers) {
            Question question = answer.getQuestion();
            if (question == null || !isObjective(question.getQuestionType())) {
                continue;
            }
            String correct = question.getCorrectAnswer();
            if (correct == null || correct.isBlank()) {
                // no answer key, lecturer has to mark it
                continue;
            }
            String given = answer.getAnswerText() != null ? answer.getAnswerText().trim() : "";
            boolean isCorrect = !given.isEmpty() && given.equalsIgnoreCase(correct.trim());
            BigDecimal fullMarks = examQuestionRepository.maxMarksFor(examId, question);
            answer.setIsCorrect(isCorrect);
            answer.setMarksAwarded(isCorrect && fullMarks != null ? fullMarks : BigDecimal.ZERO);
        }
        examAnswerRepository.saveAll(answers);
    }

    // if a question was saved twice, only the newest row counts
    static List<ExamAnswer> latestPerQuestion(List<ExamAnswer> answers) {
        java.util.Map<Object, ExamAnswer> latest = new java.util.LinkedHashMap<>();
        for (ExamAnswer a : answers) {
            Object key = a.getQuestion() != null ? a.getQuestion().getQuestionId() : "answer-" + a.getAnswerId();
            latest.merge(key, a, (x, y) -> x.getAnswerId() > y.getAnswerId() ? x : y);
        }
        return new java.util.ArrayList<>(latest.values());
    }

    private boolean isObjective(String questionType) {
        if (questionType == null) {
            return false;
        }
        String type = questionType.trim().toLowerCase().replace(' ', '_').replace('-', '_');
        return type.equals("mcq") || type.equals("true_false") || type.equals("truefalse")
                || type.equals("short_answer") || type.equals("short_text");
    }

    @Override
    public ExamAttemptResponse getAttemptById(Long attemptId) {
        if (attemptId == null) {
            throw new ValidationException("Attempt ID cannot be null");
        }
        ExamAttempt attempt = examAttemptRepository.findById(attemptId)
                .orElseThrow(() -> new EntryNotFoundException("ExamAttempt not found with ID: " + attemptId));
        return examAttemptMapper.toExamAttemptResponse(attempt);
    }

    @Override
    public List<ExamAttemptResponse> getAttemptsByExam(Long examId) {
        if (examId == null) {
            throw new ValidationException("Exam ID cannot be null");
        }
        Exam exam = examRepository.findById(examId)
                .orElseThrow(() -> new EntryNotFoundException("Exam not found with ID: " + examId));

        if (exam.getCourseOffering() != null) {
            ownershipValidator.checkLecturerOfferingAccess(exam.getCourseOffering().getOfferingId());
        }

        return examAttemptRepository.findByExam_ExamId(examId)
                .stream()
                .map(examAttemptMapper::toExamAttemptResponse)
                .toList();
    }

    @Override
    public List<ExamAttemptResponse> getAttemptsByStudent(Long studentId) {
        if (studentId == null) {
            throw new ValidationException("Student ID cannot be null");
        }
        ownershipValidator.checkStudentOwnership(studentId);

        if (!studentRepository.existsById(studentId)) {
            throw new EntryNotFoundException("Student not found with ID: " + studentId);
        }

        return examAttemptRepository.findByStudent_StudentId(studentId)
                .stream()
                .map(examAttemptMapper::toExamAttemptResponse)
                .toList();
    }
}
