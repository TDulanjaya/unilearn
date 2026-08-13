package com.unilearn.server.ai;

import com.unilearn.server.dto.request.AiQuizSessionRequest;
import com.unilearn.server.dto.response.AiQuizQuestionResponse;
import com.unilearn.server.dto.response.AiQuizSessionResponse;
import com.unilearn.server.exception.ValidationException;
import com.unilearn.server.model.User;
import com.unilearn.server.service.AiQuizQuestionService;
import com.unilearn.server.service.AiQuizSessionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/ai/quiz")
@RequiredArgsConstructor
@PreAuthorize("hasRole('STUDENT')")
public class AiQuizController {

    private final AiQuizSessionService aiQuizSessionService;
    private final AiQuizQuestionService aiQuizQuestionService;

    @PostMapping
    public ResponseEntity<AiQuizSessionResponse> startQuizSession(
            @AuthenticationPrincipal User principal,
            @Valid @RequestBody AiQuizSessionRequest request) {
        // Derive studentId from principal, never trust client-supplied studentId
        request.setStudentId(principal.getUserId());
        AiQuizSessionResponse response = aiQuizSessionService.startQuizSession(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PostMapping("/{id}/answer")
    public ResponseEntity<AiQuizQuestionResponse> answerQuestion(
            @AuthenticationPrincipal User principal,
            @PathVariable("id") Long questionId,
            @RequestBody Map<String, String> body) {
        String studentAnswer = body != null ? body.get("studentAnswer") : null;
        if (studentAnswer == null && body != null) {
            studentAnswer = body.get("answer");
        }
        if (studentAnswer == null) {
            throw new ValidationException("studentAnswer field is required in request body");
        }

        AiQuizQuestionResponse response = aiQuizQuestionService.answerQuestion(questionId, studentAnswer);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<AiQuizSessionResponse> getQuizSession(
            @AuthenticationPrincipal User principal,
            @PathVariable("id") Long sessionId) {
        AiQuizSessionResponse session = aiQuizSessionService.getQuizSession(sessionId);
        if (session.getStudentId() != null && !session.getStudentId().equals(principal.getUserId())) {
            throw new AccessDeniedException("Access denied: Students can only view their own quiz sessions");
        }
        return ResponseEntity.ok(session);
    }
}
