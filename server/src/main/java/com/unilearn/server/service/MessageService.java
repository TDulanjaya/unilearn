package com.unilearn.server.service;

import com.unilearn.server.dto.request.MessageRequest;
import com.unilearn.server.dto.response.MessageResponse;
import com.unilearn.server.dto.response.PageResponseDTO;
import org.springframework.data.domain.Pageable;

import java.util.List;

/**
 * Service interface for managing direct messages.
 */
public interface MessageService {

    MessageResponse sendMessage(MessageRequest request);

    PageResponseDTO<MessageResponse> getConversation(Long user1Id, Long user2Id, Pageable pageable);

    List<MessageResponse> getUnreadMessages(Long userId);
}
