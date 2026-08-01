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
        return AiChatMessageResponse.builder()
                .messageId(message.getMessageId())
                .studentId(message.getStudent() != null ? message.getStudent().getStudentId() : null)
                .offeringId(message.getCourseOffering() != null ? message.getCourseOffering().getOfferingId() : null)
                .role(message.getRole())
                .content(message.getContent())
                .createdAt(message.getCreatedAt())
                .build();
    }
}
