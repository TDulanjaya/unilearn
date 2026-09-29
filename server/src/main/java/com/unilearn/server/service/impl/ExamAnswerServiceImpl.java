package com.unilearn.server.service.impl;

import com.unilearn.server.dto.request.ExamAnswerRequest;
import com.unilearn.server.dto.response.ExamAnswerResponse;
import com.unilearn.server.exception.EntryNotFoundException;
import com.unilearn.server.exception.ValidationException;
import com.unilearn.server.model.ExamAnswer;
import com.unilearn.server.model.ExamAttempt;
import com.unilearn.server.model.Question;
import com.unilearn.server.repository.ExamAnswerRepository;
import com.unilearn.server.repository.ExamAttemptRepository;
import com.unilearn.server.repository.QuestionRepository;
import com.unilearn.server.service.ExamAnswerService;
import com.unilearn.server.util.mapper.ExamAnswerMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ExamAnswerServiceImpl implements ExamAnswerService {

    private final ExamAnswerRepository examAnswerRepository;
    private final ExamAttemptRepository examAttemptRepository;
    private final QuestionRepository questionRepository;
    private final com.unilearn.server.repository.ExamResultRepository examResultRepository;
    private final ExamAnswerMapper examAnswerMapper;
    private final com.unilearn.server.security.OwnershipValidator ownershipValidator;

    @Override
    @Transactional
    public ExamAnswerResponse saveAnswer(ExamAnswerRequest request, Long studentId) {
        if (request == null) {
            throw new ValidationException("ExamAnswer request cannot be null");
        }

        ExamAttempt attempt = examAttemptRepository.findById(request.getAttemptId())
                .orElseThrow(() -> new EntryNotFoundException("ExamAttempt not found with ID: " + request.getAttemptId()));

        if (studentId != null && attempt.getStudent() != null
                && !studentId.equals(attempt.getStudent().getStudentId())) {
            throw new org.springframework.security.access.AccessDeniedException("Access denied: Attempt belongs to another student");
        }

        if (attempt.getEndTime() != null || "submitted".equalsIgnoreCase(attempt.getStatus())) {
            throw new com.unilearn.server.exception.IllegalStateException("Cannot submit or modify answers after exam attempt has been submitted");
        }

        Question question = questionRepository.findById(request.getQuestionId())
                .orElseThrow(() -> new EntryNotFoundException("Question not found with ID: " + request.getQuestionId()));

        Optional<ExamAnswer> existingOpt = examAnswerRepository.findByAttempt_AttemptIdAndQuestion_QuestionId(request.getAttemptId(), request.getQuestionId());

        ExamAnswer answer;
        String text = request.getAnswerText() != null ? request.getAnswerText() : request.getSelectedOption();
        if (existingOpt.isPresent()) {
            answer = existingOpt.get();
            answer.setAnswerText(text);
            // Only lecturer sets marks
        } else {
            answer = examAnswerMapper.toExamAnswer(request, attempt, question);
        }

        ExamAnswer saved = examAnswerRepository.save(answer);
        ExamAnswerResponse response = examAnswerMapper.toExamAnswerResponse(saved);
        // Hide score and answer status during submission
        response.setIsCorrect(null);
        response.setMarksAwarded(null);
        return response;
    }

    @Override
    public List<ExamAnswerResponse> getAnswersForAttempt(Long attemptId, Long studentId) {
        if (attemptId == null) {
            throw new ValidationException("Attempt ID cannot be null");
        }
        ExamAttempt attempt = examAttemptRepository.findById(attemptId)
                .orElseThrow(() -> new EntryNotFoundException("ExamAttempt not found with ID: " + attemptId));

        if (studentId != null && attempt.getStudent() != null
                && !studentId.equals(attempt.getStudent().getStudentId())) {
            throw new org.springframework.security.access.AccessDeniedException("Access denied: Attempt belongs to another student");
        }

        var auth = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
        boolean isStudent = (studentId != null) || (auth != null && auth.getAuthorities().stream()
                .anyMatch(a -> "ROLE_STUDENT".equalsIgnoreCase(a.getAuthority())));

        if (!isStudent && attempt.getExam() != null && attempt.getExam().getCourseOffering() != null) {
            ownershipValidator.checkLecturerOfferingAccess(attempt.getExam().getCourseOffering().getOfferingId());
        }

        boolean isPublished = false;
        if (attempt.getExam() != null && attempt.getStudent() != null) {
            java.util.Optional<com.unilearn.server.model.ExamResult> resultOpt =
                    examResultRepository.findByExam_ExamIdAndStudent_StudentId(
                            attempt.getExam().getExamId(), attempt.getStudent().getStudentId());
            if (resultOpt.isPresent() && resultOpt.get().getPublishedAt() != null) {
                isPublished = true;
            }
        }

        final boolean published = isPublished;
        return examAnswerRepository.findByAttempt_AttemptId(attemptId)
                .stream()
                .map(examAnswerMapper::toExamAnswerResponse)
                .map(resp -> {
                    if (isStudent && !published) {
                        resp.setIsCorrect(null);
                        resp.setMarksAwarded(null);
                    }
                    return resp;
                })
                .toList();
    }

    @Override
    @Transactional
    public ExamAnswerResponse gradeAnswer(Long attemptId, Long questionId, BigDecimal marksAwarded) {
        if (attemptId == null || questionId == null) {
            throw new ValidationException("Attempt ID and Question ID cannot be null");
        }

        ExamAnswer answer = examAnswerRepository.findByAttempt_AttemptIdAndQuestion_QuestionId(attemptId, questionId)
                .orElseThrow(() -> new EntryNotFoundException("ExamAnswer not found for attempt ID: " + attemptId + " and question ID: " + questionId));

        if (answer.getAttempt() != null && answer.getAttempt().getExam() != null && answer.getAttempt().getExam().getCourseOffering() != null) {
            ownershipValidator.checkLecturerOfferingAccess(answer.getAttempt().getExam().getCourseOffering().getOfferingId());
        }

        answer.setMarksAwarded(marksAwarded);
        if (answer.getQuestion() != null && answer.getQuestion().getCorrectAnswer() != null) {
            answer.setIsCorrect(answer.getQuestion().getCorrectAnswer().trim().equalsIgnoreCase(answer.getAnswerText() != null ? answer.getAnswerText().trim() : ""));
        }

        ExamAnswer updated = examAnswerRepository.save(answer);
        return examAnswerMapper.toExamAnswerResponse(updated);
    }
}
