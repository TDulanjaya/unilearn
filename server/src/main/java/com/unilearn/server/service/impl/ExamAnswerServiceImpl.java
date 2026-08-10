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
    private final ExamAnswerMapper examAnswerMapper;

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
            if (request.getMarksAwarded() != null) {
                answer.setMarksAwarded(request.getMarksAwarded());
            }
        } else {
            answer = examAnswerMapper.toExamAnswer(request, attempt, question);
        }

        ExamAnswer saved = examAnswerRepository.save(answer);
        return examAnswerMapper.toExamAnswerResponse(saved);
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

        return examAnswerRepository.findByAttempt_AttemptId(attemptId)
                .stream()
                .map(examAnswerMapper::toExamAnswerResponse)
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

        answer.setMarksAwarded(marksAwarded);
        if (answer.getQuestion() != null && answer.getQuestion().getCorrectAnswer() != null) {
            answer.setIsCorrect(answer.getQuestion().getCorrectAnswer().trim().equalsIgnoreCase(answer.getAnswerText() != null ? answer.getAnswerText().trim() : ""));
        }

        ExamAnswer updated = examAnswerRepository.save(answer);
        return examAnswerMapper.toExamAnswerResponse(updated);
    }
}
