package com.unilearn.server.service.impl;

import com.unilearn.server.dto.request.examattempt.ExamAttemptStartRequestDTO;
import com.unilearn.server.dto.response.ExamAttemptResponse;
import com.unilearn.server.exception.EntryNotFoundException;
import com.unilearn.server.exception.ValidationException;
import com.unilearn.server.model.Exam;
import com.unilearn.server.model.ExamAttempt;
import com.unilearn.server.model.Student;
import com.unilearn.server.repository.ExamAttemptRepository;
import com.unilearn.server.repository.ExamRepository;
import com.unilearn.server.repository.StudentRepository;
import com.unilearn.server.service.ExamAttemptService;
import com.unilearn.server.util.mapper.ExamAttemptMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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

    @Override
    @Transactional
    public ExamAttemptResponse startAttempt(ExamAttemptStartRequestDTO request) {
        if (request == null) {
            throw new ValidationException("ExamAttempt request cannot be null");
        }

        Exam exam = examRepository.findById(request.getExamId())
                .orElseThrow(() -> new EntryNotFoundException("Exam not found with ID: " + request.getExamId()));

        Student student = studentRepository.findById(request.getStudentId())
                .orElseThrow(() -> new EntryNotFoundException("Student not found with ID: " + request.getStudentId()));

        Optional<ExamAttempt> existingOpt = examAttemptRepository.findByExam_ExamIdAndStudent_StudentId(request.getExamId(), request.getStudentId());
        if (existingOpt.isPresent()) {
            ExamAttempt existing = existingOpt.get();
            if ("submitted".equalsIgnoreCase(existing.getStatus()) || existing.getEndTime() != null) {
                throw new com.unilearn.server.exception.DuplicateEntryException("Student already has an active or completed attempt for this exam");
            }
            return examAttemptMapper.toExamAttemptResponse(existing);
        }

        ExamAttempt attempt = examAttemptMapper.toExamAttempt(request, exam, student);
        ExamAttempt saved = examAttemptRepository.save(attempt);
        return examAttemptMapper.toExamAttemptResponse(saved);
    }

    @Override
    @Transactional
    public ExamAttemptResponse submitAttempt(Long attemptId) {
        if (attemptId == null) {
            throw new ValidationException("Attempt ID cannot be null");
        }

        ExamAttempt attempt = examAttemptRepository.findById(attemptId)
                .orElseThrow(() -> new EntryNotFoundException("ExamAttempt not found with ID: " + attemptId));

        if ("submitted".equalsIgnoreCase(attempt.getStatus())) {
            throw new com.unilearn.server.exception.IllegalStateException("Exam attempt is already submitted");
        }

        attempt.setEndTime(LocalDateTime.now());
        attempt.setStatus("submitted");

        ExamAttempt updated = examAttemptRepository.save(attempt);
        return examAttemptMapper.toExamAttemptResponse(updated);
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
        if (!examRepository.existsById(examId)) {
            throw new EntryNotFoundException("Exam not found with ID: " + examId);
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
        if (!studentRepository.existsById(studentId)) {
            throw new EntryNotFoundException("Student not found with ID: " + studentId);
        }

        return examAttemptRepository.findByStudent_StudentId(studentId)
                .stream()
                .map(examAttemptMapper::toExamAttemptResponse)
                .toList();
    }
}
