package com.unilearn.server.service;

import com.unilearn.server.dto.request.MessageRequest;
import com.unilearn.server.dto.response.ContactResponse;
import com.unilearn.server.dto.response.MessageResponse;
import com.unilearn.server.dto.response.PageResponseDTO;
import org.springframework.data.domain.Pageable;

import java.util.List;

// Direct messages service
public interface MessageService {

    MessageResponse sendMessage(Long senderId, MessageRequest request);

    PageResponseDTO<MessageResponse> getConversation(Long user1Id, Long user2Id, Pageable pageable);

    List<MessageResponse> getUnreadMessages(Long userId);

    List<ContactResponse> getContacts(Long userId);
}
