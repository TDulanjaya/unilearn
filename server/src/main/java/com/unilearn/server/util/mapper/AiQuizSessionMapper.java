package com.unilearn.server.util.mapper;

import com.unilearn.server.dto.request.AiQuizSessionRequest;
import com.unilearn.server.dto.response.AiQuizQuestionResponse;
import com.unilearn.server.dto.response.AiQuizSessionResponse;
import com.unilearn.server.exception.ValidationException;
import com.unilearn.server.model.AiQuizSession;
import com.unilearn.server.model.CourseOffering;
import com.unilearn.server.model.Student;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;

@Component
@RequiredArgsConstructor
public class AiQuizSessionMapper {

    private final AiQuizQuestionMapper aiQuizQuestionMapper;

    public AiQuizSession toAiQuizSession(AiQuizSessionRequest request, Student student, CourseOffering offering) {
        if (request == null) {
            throw new ValidationException("AiQuizSession request cannot be null");
        }
        return AiQuizSession.builder()
                .student(student)
                .courseOffering(offering)
                .questionType(request.getQuestionType())
                .questionCount(request.getQuestionCount())
                .sourceScope(request.getSourceScope())
                .createdAt(LocalDateTime.now())
                .build();
    }

    public AiQuizSessionResponse toAiQuizSessionResponse(AiQuizSession session) {
        if (session == null) {
            throw new ValidationException("AiQuizSession cannot be null");
        }
        List<AiQuizQuestionResponse> questionResponses = session.getQuestions() != null
                ? session.getQuestions().stream().map(aiQuizQuestionMapper::toAiQuizQuestionResponse).toList()
                : Collections.emptyList();

        return AiQuizSessionResponse.builder()
                .sessionId(session.getSessionId())
                .studentId(session.getStudent() != null ? session.getStudent().getStudentId() : null)
                .offeringId(session.getCourseOffering() != null ? session.getCourseOffering().getOfferingId() : null)
                .questionType(session.getQuestionType())
                .questionCount(session.getQuestionCount())
                .sourceScope(session.getSourceScope())
                .createdAt(session.getCreatedAt())
                .questions(questionResponses)
                .build();
    }
}
