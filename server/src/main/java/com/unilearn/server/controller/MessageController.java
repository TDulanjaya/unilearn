package com.unilearn.server.controller;

import com.unilearn.server.dto.request.MessageRequest;
import com.unilearn.server.dto.response.MessageResponse;
import com.unilearn.server.dto.response.PageResponseDTO;
import com.unilearn.server.model.User;
import com.unilearn.server.service.MessageService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/messages")
@RequiredArgsConstructor
public class MessageController {

    private final MessageService messageService;

    @PostMapping
    public ResponseEntity<MessageResponse> sendMessage(
            @AuthenticationPrincipal User principal,
            @Valid @RequestBody MessageRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(messageService.sendMessage(principal.getUserId(), request));
    }

    @GetMapping("/thread/{otherUserId}")
    public ResponseEntity<PageResponseDTO<MessageResponse>> getThread(
            @AuthenticationPrincipal User principal,
            @PathVariable Long otherUserId,
            @PageableDefault(size = 20) Pageable pageable) {
        return ResponseEntity.ok(messageService.getConversation(principal.getUserId(), otherUserId, pageable));
    }

    @GetMapping("/me/unread")
    public ResponseEntity<List<MessageResponse>> getUnreadForUser(@AuthenticationPrincipal User principal) {
        return ResponseEntity.ok(messageService.getUnreadMessages(principal.getUserId()));
    }
}
