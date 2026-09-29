package com.unilearn.server.util.mapper;

import com.unilearn.server.dto.request.AiChatMessageRequest;
import com.unilearn.server.dto.response.AiChatMessageResponse;
import com.unilearn.server.exception.ValidationException;
import com.unilearn.server.model.AiChatMessage;
import com.unilearn.server.model.CourseOffering;
import com.unilearn.server.model.Student;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Component
public class AiChatMessageMapper {

    public AiChatMessage toAiChatMessage(AiChatMessageRequest request, Student student, CourseOffering offering) {
        if (request == null) {
            throw new ValidationException("AiChatMessage request cannot be null");
        }
        return AiChatMessage.builder()
                .student(student)
                .courseOffering(offering)
                .role(request.getRole())
                .content(request.getContent())
                .createdAt(LocalDateTime.now())
                .build();
    }

    public AiChatMessageResponse toAiChatMessageResponse(AiChatMessage message) {
        if (message == null) {
            throw new ValidationException("AiChatMessage cannot be null");
        }
        java.util.List<String> sourceList = new java.util.ArrayList<>();
        java.util.List<String> courseSources = new java.util.ArrayList<>();
        java.util.List<String> noteSources = new java.util.ArrayList<>();

        if (message.getSources() != null && !message.getSources().isBlank()) {
            String[] tokens = message.getSources().split("\\s*\\|\\|\\s*|\\s*,\\s*");
            for (String raw : tokens) {
                String token = raw.trim();
                if (token.isEmpty()) continue;

                if (token.startsWith("[Notes] ") || token.startsWith("NOTES:")) {
                    String clean = token.replaceFirst("^\\[Notes\\]\\s*|^NOTES:\\s*", "").trim();
                    if (!noteSources.contains(clean)) noteSources.add(clean);
                    if (!sourceList.contains(clean)) sourceList.add(clean);
                } else if (token.startsWith("[Course] ") || token.startsWith("COURSE:") || token.startsWith("[Lecturer] ")) {
                    String clean = token.replaceFirst("^\\[Course\\]\\s*|^COURSE:\\s*|^\\[Lecturer\\]\\s*", "").trim();
                    if (!courseSources.contains(clean)) courseSources.add(clean);
                    if (!sourceList.contains(clean)) sourceList.add(clean);
                } else {
                    if (!courseSources.contains(token)) courseSources.add(token);
                    if (!sourceList.contains(token)) sourceList.add(token);
                }
            }
        }

        return AiChatMessageResponse.builder()
                .messageId(message.getMessageId())
                .studentId(message.getStudent() != null ? message.getStudent().getStudentId() : null)
                .offeringId(message.getCourseOffering() != null ? message.getCourseOffering().getOfferingId() : null)
                .role(message.getRole())
                .content(message.getContent())
                .sources(sourceList.isEmpty() ? null : sourceList)
                .courseSources(courseSources.isEmpty() ? null : courseSources)
                .noteSources(noteSources.isEmpty() ? null : noteSources)
                .createdAt(message.getCreatedAt())
                .build();
    }
}
