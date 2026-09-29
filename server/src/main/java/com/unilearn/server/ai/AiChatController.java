package com.unilearn.server.ai;

import com.unilearn.server.dto.request.AiChatMessageRequest;
import com.unilearn.server.dto.response.AiChatMessageResponse;
import com.unilearn.server.model.User;
import com.unilearn.server.service.AiChatMessageService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/ai/chat")
@RequiredArgsConstructor
@PreAuthorize("hasRole('STUDENT')")
public class AiChatController {

    private final AiChatMessageService aiChatMessageService;

    @PostMapping
    public ResponseEntity<AiChatMessageResponse> askQuestion(
            @AuthenticationPrincipal User principal,
            @Valid @RequestBody AiChatMessageRequest request) {
        // use authenticated student id
        request.setStudentId(principal.getUserId());
        if (request.getRole() == null || request.getRole().isBlank()) {
            request.setRole("user");
        }
        AiChatMessageResponse response = aiChatMessageService.saveMessage(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping
    public ResponseEntity<List<AiChatMessageResponse>> getChatHistory(
            @AuthenticationPrincipal User principal,
            @RequestParam("offeringId") Long offeringId) {
        List<AiChatMessageResponse> history = aiChatMessageService.getChatHistory(principal.getUserId(), offeringId);
        return ResponseEntity.ok(history);
    }

    @DeleteMapping
    public ResponseEntity<Void> clearChatHistory(
            @AuthenticationPrincipal User principal,
            @RequestParam("offeringId") Long offeringId) {
        aiChatMessageService.clearChatHistory(principal.getUserId(), offeringId);
        return ResponseEntity.noContent().build();
    }
}
