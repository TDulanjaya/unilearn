package com.unilearn.server.service;

import com.unilearn.server.dto.request.AiChatMessageRequest;
import com.unilearn.server.dto.response.AiChatMessageResponse;

import java.util.List;

/**
 * Service interface for managing AI chat messages.
 */
public interface AiChatMessageService {

    AiChatMessageResponse saveMessage(AiChatMessageRequest request);

    List<AiChatMessageResponse> getChatHistory(Long studentId, Long offeringId);

    void clearChatHistory(Long studentId, Long offeringId);
}
