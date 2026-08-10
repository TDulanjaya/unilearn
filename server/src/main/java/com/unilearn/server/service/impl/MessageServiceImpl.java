package com.unilearn.server.service.impl;

import com.unilearn.server.dto.request.MessageRequest;
import com.unilearn.server.dto.response.MessageResponse;
import com.unilearn.server.dto.response.PageResponseDTO;
import com.unilearn.server.exception.EntryNotFoundException;
import com.unilearn.server.exception.ValidationException;
import com.unilearn.server.model.Message;
import com.unilearn.server.model.User;
import com.unilearn.server.repository.MessageRepository;
import com.unilearn.server.repository.UserRepository;
import com.unilearn.server.service.MessageService;
import com.unilearn.server.util.mapper.MessageMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class MessageServiceImpl implements MessageService {

    private final MessageRepository messageRepository;
    private final UserRepository userRepository;
    private final MessageMapper messageMapper;

    @Override
    @Transactional
    public MessageResponse sendMessage(Long senderId, MessageRequest request) {
        if (senderId == null) {
            throw new ValidationException("Sender ID cannot be null");
        }
        if (request == null) {
            throw new ValidationException("Message request cannot be null");
        }

        User sender = userRepository.findById(senderId)
                .orElseThrow(() -> new EntryNotFoundException("User not found with ID: " + senderId));

        User receiver = userRepository.findById(request.getReceiverId())
                .orElseThrow(() -> new EntryNotFoundException("User not found with ID: " + request.getReceiverId()));

        Message message = messageMapper.toMessage(request, sender, receiver);
        Message saved = messageRepository.save(message);
        return messageMapper.toMessageResponse(saved);
    }

    @Override
    public PageResponseDTO<MessageResponse> getConversation(Long user1Id, Long user2Id, Pageable pageable) {
        if (user1Id == null || user2Id == null) {
            throw new ValidationException("User IDs cannot be null");
        }
        if (pageable == null) {
            throw new ValidationException("Pageable parameter cannot be null");
        }
        if (!userRepository.existsById(user1Id)) {
            throw new EntryNotFoundException("User not found with ID: " + user1Id);
        }
        if (!userRepository.existsById(user2Id)) {
            throw new EntryNotFoundException("User not found with ID: " + user2Id);
        }

        Page<Message> page = messageRepository.findConversation(user1Id, user2Id, pageable);
        List<MessageResponse> content = page.getContent()
                .stream()
                .map(messageMapper::toMessageResponse)
                .toList();

        return PageResponseDTO.<MessageResponse>builder()
                .dataCount((int) page.getTotalElements())
                .dataList(content)
                .build();
    }

    @Override
    public List<MessageResponse> getUnreadMessages(Long userId) {
        if (userId == null) {
            throw new ValidationException("User ID cannot be null");
        }
        if (!userRepository.existsById(userId)) {
            throw new EntryNotFoundException("User not found with ID: " + userId);
        }

        return messageRepository.findByReceiver_UserIdAndReadAtIsNull(userId)
                .stream()
                .map(messageMapper::toMessageResponse)
                .toList();
    }
}
