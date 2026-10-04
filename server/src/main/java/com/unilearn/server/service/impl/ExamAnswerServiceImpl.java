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
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ExamAnswerServiceImpl implements ExamAnswerService {

    private final ExamAnswerRepository examAnswerRepository;
    private final ExamAttemptRepository examAttemptRepository;
    private final QuestionRepository questionRepository;
    private final com.unilearn.server.repository.ExamResultRepository examResultRepository;
    private final com.unilearn.server.repository.ExamQuestionRepository examQuestionRepository;
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

        // stop here if the exam time is over (1 minute grace)
        LocalDateTime deadline = examAttemptRepository.deadlineOf(attempt);
        if (deadline != null && LocalDateTime.now().isAfter(deadline.plusMinutes(1))) {
            throw new com.unilearn.server.exception.IllegalStateException("Exam time is over. New answers can no longer be saved. Please submit your exam.");
        }

        Question question = questionRepository.findById(request.getQuestionId())
                .orElseThrow(() -> new EntryNotFoundException("Question not found with ID: " + request.getQuestionId()));

        List<ExamAnswer> existing = examAnswerRepository.findAllByAttempt_AttemptIdAndQuestion_QuestionIdOrderByAnswerIdAsc(request.getAttemptId(), request.getQuestionId());

        ExamAnswer answer;
        String text = request.getAnswerText() != null ? request.getAnswerText() : request.getSelectedOption();
        if (!existing.isEmpty()) {
            // old rows are updated, not added again
            answer = existing.get(0);
            answer.setAnswerText(text);
            if (existing.size() > 1) {
                examAnswerRepository.deleteAll(existing.subList(1, existing.size()));
            }
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

        List<ExamAnswer> found = examAnswerRepository.findAllByAttempt_AttemptIdAndQuestion_QuestionIdOrderByAnswerIdAsc(attemptId, questionId);
        if (found.isEmpty()) {
            throw new EntryNotFoundException("ExamAnswer not found for attempt ID: " + attemptId + " and question ID: " + questionId);
        }
        ExamAnswer answer = found.get(0);

        if (answer.getAttempt() != null && answer.getAttempt().getExam() != null && answer.getAttempt().getExam().getCourseOffering() != null) {
            ownershipValidator.checkLecturerOfferingAccess(answer.getAttempt().getExam().getCourseOffering().getOfferingId());
        }

        if (marksAwarded == null) {
            throw new ValidationException("Marks awarded is required");
        }
        if (marksAwarded.compareTo(BigDecimal.ZERO) < 0) {
            throw new ValidationException("Marks awarded cannot be negative");
        }
        // marks can't be more than the question is worth
        Long examId = answer.getAttempt() != null && answer.getAttempt().getExam() != null ? answer.getAttempt().getExam().getExamId() : null;
        BigDecimal maxMarks = examQuestionRepository.maxMarksFor(examId, answer.getQuestion());
        if (maxMarks != null && marksAwarded.compareTo(maxMarks) > 0) {
            throw new ValidationException("Marks awarded cannot be more than " + maxMarks.stripTrailingZeros().toPlainString() + " for this question");
        }

        answer.setMarksAwarded(marksAwarded);
        if (answer.getQuestion() != null && answer.getQuestion().getCorrectAnswer() != null) {
            answer.setIsCorrect(answer.getQuestion().getCorrectAnswer().trim().equalsIgnoreCase(answer.getAnswerText() != null ? answer.getAnswerText().trim() : ""));
        }

        ExamAnswer updated = examAnswerRepository.save(answer);
        return examAnswerMapper.toExamAnswerResponse(updated);
    }
}
