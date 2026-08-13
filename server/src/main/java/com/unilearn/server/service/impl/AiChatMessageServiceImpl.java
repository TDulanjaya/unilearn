package com.unilearn.server.service.impl;

import com.unilearn.server.ai.AiGroundingContextHelper;
import com.unilearn.server.ai.AiProviderClient;
import com.unilearn.server.dto.request.AiChatMessageRequest;
import com.unilearn.server.dto.response.AiChatMessageResponse;
import com.unilearn.server.exception.EntryNotFoundException;
import com.unilearn.server.exception.ValidationException;
import com.unilearn.server.model.AiChatMessage;
import com.unilearn.server.model.CourseOffering;
import com.unilearn.server.model.Student;
import com.unilearn.server.repository.AiChatMessageRepository;
import com.unilearn.server.repository.CourseOfferingRepository;
import com.unilearn.server.repository.StudentRepository;
import com.unilearn.server.service.AiChatMessageService;
import com.unilearn.server.util.mapper.AiChatMessageMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AiChatMessageServiceImpl implements AiChatMessageService {

    private final AiChatMessageRepository aiChatMessageRepository;
    private final StudentRepository studentRepository;
    private final CourseOfferingRepository courseOfferingRepository;
    private final AiChatMessageMapper aiChatMessageMapper;
    private final AiProviderClient aiProviderClient;
    private final AiGroundingContextHelper aiGroundingContextHelper;

    @Override
    @Transactional
    public AiChatMessageResponse saveMessage(AiChatMessageRequest request) {
        if (request == null) {
            throw new ValidationException("AiChatMessage request cannot be null");
        }

        Student student = studentRepository.findById(request.getStudentId())
                .orElseThrow(() -> new EntryNotFoundException("Student not found with ID: " + request.getStudentId()));

        CourseOffering offering = courseOfferingRepository.findById(request.getOfferingId())
                .orElseThrow(() -> new EntryNotFoundException("CourseOffering not found with ID: " + request.getOfferingId()));

        // 1. Persist the user's prompt as a role="user" message
        AiChatMessage userMessage = AiChatMessage.builder()
                .student(student)
                .courseOffering(offering)
                .role("user")
                .content(request.getContent())
                .createdAt(LocalDateTime.now())
                .build();
        aiChatMessageRepository.save(userMessage);

        // 2. Fetch existing chat history for grounding context
        List<AiChatMessage> priorMessages = aiChatMessageRepository
                .findByStudent_StudentIdAndCourseOffering_OfferingIdOrderByCreatedAtAsc(student.getStudentId(), offering.getOfferingId());

        // 3. Fetch course material context
        String courseContext = aiGroundingContextHelper.fetchCourseContext(offering.getOfferingId(), "full_course");

        // 4. Generate grounded AI response
        String aiAnswer = aiProviderClient.generateChatAnswer(courseContext, "full_course", priorMessages, request.getContent());

        // 5. Persist AI response as a role="assistant" message
        AiChatMessage assistantMessage = AiChatMessage.builder()
                .student(student)
                .courseOffering(offering)
                .role("assistant")
                .content(aiAnswer)
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
