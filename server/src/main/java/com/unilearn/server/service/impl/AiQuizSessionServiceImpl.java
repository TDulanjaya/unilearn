package com.unilearn.server.service.impl;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.unilearn.server.ai.AiGroundingContextHelper;
import com.unilearn.server.ai.AiProviderClient;
import com.unilearn.server.dto.request.AiQuizQuestionRequest;
import com.unilearn.server.dto.request.AiQuizSessionRequest;
import com.unilearn.server.dto.response.AiQuizSessionResponse;
import com.unilearn.server.exception.EntryNotFoundException;
import com.unilearn.server.exception.RateLimitExceededException;
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
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class AiQuizSessionServiceImpl implements AiQuizSessionService {

    private static final int DAILY_SESSION_LIMIT = 10;
    private static final int MAX_QUESTIONS_PER_SESSION = 50;

    private final AiQuizSessionRepository aiQuizSessionRepository;
    private final AiQuizQuestionRepository aiQuizQuestionRepository;
    private final StudentRepository studentRepository;
    private final CourseOfferingRepository courseOfferingRepository;
    private final AiQuizSessionMapper aiQuizSessionMapper;
    private final AiProviderClient aiProviderClient;
    private final AiGroundingContextHelper aiGroundingContextHelper;
    private final ObjectMapper objectMapper;

    @Override
    @Transactional
    public AiQuizSessionResponse startQuizSession(AiQuizSessionRequest request) {
        if (request == null) {
            throw new ValidationException("AiQuizSession request cannot be null");
        }

        // Daily rate limit check (FR-AI-08 / SRS 9.2 cost guardrail)
        LocalDateTime startOfDay = LocalDate.now().atStartOfDay();
        long todayCount = aiQuizSessionRepository.countByStudent_StudentIdAndCreatedAtGreaterThanEqual(
                request.getStudentId(), startOfDay);
        if (todayCount >= DAILY_SESSION_LIMIT) {
            throw new RateLimitExceededException("Daily quiz generation limit reached (" + DAILY_SESSION_LIMIT + " sessions per day). Please try again tomorrow.");
        }

        Student student = studentRepository.findById(request.getStudentId())
                .orElseThrow(() -> new EntryNotFoundException("Student not found with ID: " + request.getStudentId()));

        CourseOffering offering = courseOfferingRepository.findById(request.getOfferingId())
                .orElseThrow(() -> new EntryNotFoundException("CourseOffering not found with ID: " + request.getOfferingId()));

        // Cap question count at 50 per FR-AI-02
        int count = Math.min(request.getQuestionCount() != null ? request.getQuestionCount() : 5, MAX_QUESTIONS_PER_SESSION);
        request.setQuestionCount(count);

        AiQuizSession session = aiQuizSessionMapper.toAiQuizSession(request, student, offering);
        AiQuizSession savedSession = aiQuizSessionRepository.save(session);

        // Fetch grounding context for offering and scope (including student personal resources)
        String courseContext = aiGroundingContextHelper.fetchCourseContext(request.getOfferingId(), student.getStudentId(), request.getSourceScope());

        // Generate quiz questions using Gemini API
        List<AiProviderClient.GeneratedQuestionData> generatedDataList = aiProviderClient.generateQuizQuestions(
                courseContext, request.getSourceScope(), request.getQuestionType(), count);

        List<AiQuizQuestion> questionEntities = new ArrayList<>();
        int orderNo = 1;
        for (AiProviderClient.GeneratedQuestionData data : generatedDataList) {
            String optionsJson = null;
            if ("mcq".equalsIgnoreCase(request.getQuestionType()) && data.getOptions() != null) {
                try {
                    optionsJson = objectMapper.writeValueAsString(data.getOptions());
                } catch (JsonProcessingException e) {
                    log.error("Failed to serialize options to JSON", e);
                }
            }

            AiQuizQuestion q = AiQuizQuestion.builder()
                    .quizSession(savedSession)
                    .orderNo(orderNo++)
                    .questionText(data.getQuestionText() != null ? data.getQuestionText() : "Question text")
                    .questionType(request.getQuestionType())
                    .options(optionsJson)
                    .correctAnswer(data.getCorrectAnswer() != null ? data.getCorrectAnswer() : "")
                    .studentAnswer(null)
                    .isCorrect(null)
                    .answerRevealed(false)
                    .build();

            questionEntities.add(q);
        }

        List<AiQuizQuestion> savedQuestions = aiQuizQuestionRepository.saveAll(questionEntities);
        savedSession.setQuestions(savedQuestions);

        return aiQuizSessionMapper.toAiQuizSessionResponse(savedSession);
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
                        if ("mcq".equalsIgnoreCase(q.getQuestionType())) {
                            if (q.getCorrectAnswer() != null && req.getStudentAnswer() != null) {
                                q.setIsCorrect(q.getCorrectAnswer().trim().equalsIgnoreCase(req.getStudentAnswer().trim()));
                            }
                        } else {
                            // Structured questions: do NOT auto-grade (FR-AI-05)
                            q.setIsCorrect(null);
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
