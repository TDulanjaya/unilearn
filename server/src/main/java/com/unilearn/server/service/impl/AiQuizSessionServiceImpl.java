package com.unilearn.server.service.impl;

import com.unilearn.server.dto.request.AiQuizQuestionRequest;
import com.unilearn.server.dto.request.AiQuizSessionRequest;
import com.unilearn.server.dto.response.AiQuizSessionResponse;
import com.unilearn.server.exception.EntryNotFoundException;
import com.unilearn.server.exception.ValidationException;
import com.unilearn.server.model.AiQuizQuestion;
import com.unilearn.server.model.AiQuizSession;
import com.unilearn.server.model.CourseOffering;
import com.unilearn.server.model.Student;
import com.unilearn.server.repository.AiQuizQuestionRepository;
import com.unilearn.server.repository.AiQuizSessionRepository;
import com.unilearn.server.repository.CourseOfferingRepository;
import com.unilearn.server.repository.StudentRepository;
import com.unilearn.server.service.AiQuizSessionService;
import com.unilearn.server.util.mapper.AiQuizSessionMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AiQuizSessionServiceImpl implements AiQuizSessionService {

    private final AiQuizSessionRepository aiQuizSessionRepository;
    private final AiQuizQuestionRepository aiQuizQuestionRepository;
    private final StudentRepository studentRepository;
    private final CourseOfferingRepository courseOfferingRepository;
    private final AiQuizSessionMapper aiQuizSessionMapper;

    @Override
    @Transactional
    public AiQuizSessionResponse startQuizSession(AiQuizSessionRequest request) {
        if (request == null) {
            throw new ValidationException("AiQuizSession request cannot be null");
        }

        Student student = studentRepository.findById(request.getStudentId())
                .orElseThrow(() -> new EntryNotFoundException("Student not found with ID: " + request.getStudentId()));

        CourseOffering offering = courseOfferingRepository.findById(request.getOfferingId())
                .orElseThrow(() -> new EntryNotFoundException("CourseOffering not found with ID: " + request.getOfferingId()));

        AiQuizSession session = aiQuizSessionMapper.toAiQuizSession(request, student, offering);
        AiQuizSession saved = aiQuizSessionRepository.save(session);
        return aiQuizSessionMapper.toAiQuizSessionResponse(saved);
    }

    @Override
    @Transactional
    public AiQuizSessionResponse submitQuizAnswers(Long sessionId, List<AiQuizQuestionRequest> answers) {
        if (sessionId == null) {
            throw new ValidationException("Session ID cannot be null");
        }
        if (answers == null) {
            throw new ValidationException("Answers list cannot be null");
        }

        AiQuizSession session = aiQuizSessionRepository.findById(sessionId)
                .orElseThrow(() -> new EntryNotFoundException("AiQuizSession not found with ID: " + sessionId));

        List<AiQuizQuestion> questions = aiQuizQuestionRepository.findByQuizSession_SessionId(sessionId);
        for (AiQuizQuestionRequest req : answers) {
            questions.stream()
                    .filter(q -> q.getQuestionId().equals(req.getQuestionId()))
                    .findFirst()
                    .ifPresent(q -> {
                        q.setStudentAnswer(req.getStudentAnswer());
                        q.setAnswerRevealed(true);
                        if (q.getCorrectAnswer() != null) {
                            q.setIsCorrect(q.getCorrectAnswer().trim().equalsIgnoreCase(req.getStudentAnswer().trim()));
                        }
                        aiQuizQuestionRepository.save(q);
                    });
        }

        return getQuizSession(sessionId);
    }

    @Override
    public AiQuizSessionResponse getQuizSession(Long sessionId) {
        if (sessionId == null) {
            throw new ValidationException("Session ID cannot be null");
        }
        AiQuizSession session = aiQuizSessionRepository.findById(sessionId)
                .orElseThrow(() -> new EntryNotFoundException("AiQuizSession not found with ID: " + sessionId));
        return aiQuizSessionMapper.toAiQuizSessionResponse(session);
    }
}
