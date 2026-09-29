package com.unilearn.server.service.impl;

import com.unilearn.server.ai.AiGroundingContextHelper;
import com.unilearn.server.ai.AiProviderClient;
import com.unilearn.server.dto.request.AiChatMessageRequest;
import com.unilearn.server.dto.response.AiChatMessageResponse;
import com.unilearn.server.exception.EntryNotFoundException;
import com.unilearn.server.exception.RateLimitExceededException;
import com.unilearn.server.exception.ValidationException;
import com.unilearn.server.model.AiChatMessage;
import com.unilearn.server.model.CourseOffering;
import com.unilearn.server.model.Student;
import com.unilearn.server.repository.AiChatMessageRepository;
import com.unilearn.server.repository.CourseOfferingRepository;
import com.unilearn.server.repository.EnrollmentRepository;
import com.unilearn.server.repository.ExamAttemptRepository;
import com.unilearn.server.repository.StudentRepository;
import com.unilearn.server.service.AiChatMessageService;
import com.unilearn.server.util.mapper.AiChatMessageMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class AiChatMessageServiceImpl implements AiChatMessageService {

    private static final int MAX_QUESTION_LENGTH = 2000;
    private static final int MAX_HISTORY_MESSAGES = 10;

    @Value("${ai.daily-limit.chat:50}")
    private int dailyChatLimit;

    private final AiChatMessageRepository aiChatMessageRepository;
    private final StudentRepository studentRepository;
    private final CourseOfferingRepository courseOfferingRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final ExamAttemptRepository examAttemptRepository;
    private final AiChatMessageMapper aiChatMessageMapper;
    private final AiProviderClient aiProviderClient;
    private final AiGroundingContextHelper aiGroundingContextHelper;

    @Override
    @Transactional
    public AiChatMessageResponse saveMessage(AiChatMessageRequest request) {
        if (request == null) {
            throw new ValidationException("AiChatMessage request cannot be null");
        }

        String questionContent = request.getContent() != null ? request.getContent().trim() : "";
        if (questionContent.isEmpty()) {
            throw new ValidationException("Question content cannot be empty.");
        }
        if (questionContent.length() > MAX_QUESTION_LENGTH) {
            throw new ValidationException("Question length exceeds the maximum allowed limit of " + MAX_QUESTION_LENGTH + " characters.");
        }

        Student student = studentRepository.findById(request.getStudentId())
                .orElseThrow(() -> new EntryNotFoundException("Student not found with ID: " + request.getStudentId()));

        CourseOffering offering = courseOfferingRepository.findById(request.getOfferingId())
                .orElseThrow(() -> new EntryNotFoundException("CourseOffering not found with ID: " + request.getOfferingId()));

        // verify student is enrolled
        boolean isEnrolled = enrollmentRepository.existsByStudent_StudentIdAndCourseOffering_OfferingId(
                student.getStudentId(), offering.getOfferingId());
        if (!isEnrolled) {
            throw new AccessDeniedException("Access denied: You must be enrolled in this course offering to use the AI assistant.");
        }

        // block access during active exams
        boolean hasActiveExam = examAttemptRepository.hasActiveExamAttempt(student.getStudentId());
        if (hasActiveExam) {
            throw new AccessDeniedException("Access denied: AI assistant is disabled while you have an active exam attempt in progress.");
        }

        // daily chat rate limit
        LocalDateTime startOfDay = LocalDate.now().atStartOfDay();
        long userMessagesToday = aiChatMessageRepository.countByStudent_StudentIdAndRoleAndCreatedAtGreaterThanEqual(
                student.getStudentId(), "user", startOfDay);
        if (userMessagesToday >= dailyChatLimit) {
            throw new RateLimitExceededException("Daily AI chat limit reached (" + dailyChatLimit + " messages per day). Please try again tomorrow.");
        }

        // save student prompt
        AiChatMessage userMessage = AiChatMessage.builder()
                .student(student)
                .courseOffering(offering)
                .role("user")
                .content(questionContent)
                .createdAt(LocalDateTime.now())
                .build();
        aiChatMessageRepository.save(userMessage);

        // grab last 10 messages for conversation context
        List<AiChatMessage> priorMessages = aiChatMessageRepository
                .findByStudent_StudentIdAndCourseOffering_OfferingIdOrderByCreatedAtAsc(student.getStudentId(), offering.getOfferingId());
        List<AiChatMessage> boundedHistory = priorMessages;
        if (priorMessages.size() > MAX_HISTORY_MESSAGES) {
            boundedHistory = priorMessages.subList(priorMessages.size() - MAX_HISTORY_MESSAGES, priorMessages.size());
        }

        // get relevant course chunks for prompt
        String sourceScope = request.getSourceScope() != null && !request.getSourceScope().isBlank()
                ? request.getSourceScope()
                : "both";
        AiGroundingContextHelper.GroundedContextResult groundingResult =
                aiGroundingContextHelper.fetchRelevantCourseContext(offering.getOfferingId(), student.getStudentId(), sourceScope, questionContent, 6);

        // call gemini with course context
        String aiAnswer = aiProviderClient.generateChatAnswer(
                groundingResult.getContextText(), sourceScope, boundedHistory, questionContent);

        // format source citations
        List<String> labeledSources = new java.util.ArrayList<>();
        if (groundingResult.getCourseSources() != null) {
            for (String src : groundingResult.getCourseSources()) {
                labeledSources.add("[Course] " + src);
            }
        }
        if (groundingResult.getNoteSources() != null) {
            for (String src : groundingResult.getNoteSources()) {
                labeledSources.add("[Notes] " + src);
            }
        }
        String sourcesJoined = labeledSources.isEmpty() ? null : String.join(" || ", labeledSources);

        // store assistant reply
        AiChatMessage assistantMessage = AiChatMessage.builder()
                .student(student)
                .courseOffering(offering)
                .role("assistant")
                .content(aiAnswer)
                .sources(sourcesJoined)
                .createdAt(LocalDateTime.now())
                .build();
        AiChatMessage savedAssistant = aiChatMessageRepository.save(assistantMessage);

        return aiChatMessageMapper.toAiChatMessageResponse(savedAssistant);
    }

    @Override
    public List<AiChatMessageResponse> getChatHistory(Long studentId, Long offeringId) {
        if (studentId == null || offeringId == null) {
            throw new ValidationException("Student ID and Offering ID cannot be null");
        }
        if (!studentRepository.existsById(studentId)) {
            throw new EntryNotFoundException("Student not found with ID: " + studentId);
        }
        if (!courseOfferingRepository.existsById(offeringId)) {
            throw new EntryNotFoundException("CourseOffering not found with ID: " + offeringId);
        }

        return aiChatMessageRepository.findByStudent_StudentIdAndCourseOffering_OfferingIdOrderByCreatedAtAsc(studentId, offeringId)
                .stream()
                .map(aiChatMessageMapper::toAiChatMessageResponse)
                .toList();
    }

    @Override
    @Transactional
    public void clearChatHistory(Long studentId, Long offeringId) {
        if (studentId == null || offeringId == null) {
            throw new ValidationException("Student ID and Offering ID cannot be null");
        }
        if (!studentRepository.existsById(studentId)) {
            throw new EntryNotFoundException("Student not found with ID: " + studentId);
        }
        if (!courseOfferingRepository.existsById(offeringId)) {
            throw new EntryNotFoundException("CourseOffering not found with ID: " + offeringId);
        }

        List<AiChatMessage> messages = aiChatMessageRepository.findByStudent_StudentIdAndCourseOffering_OfferingId(studentId, offeringId);
        aiChatMessageRepository.deleteAll(messages);
    }
}
