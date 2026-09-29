package com.unilearn.server.service;

import com.unilearn.server.dto.request.AiChatMessageRequest;
import com.unilearn.server.dto.response.AiChatMessageResponse;

import java.util.List;

// Ai chat messages service
public interface AiChatMessageService {

    AiChatMessageResponse saveMessage(AiChatMessageRequest request);

    List<AiChatMessageResponse> getChatHistory(Long studentId, Long offeringId);

    void clearChatHistory(Long studentId, Long offeringId);
}
