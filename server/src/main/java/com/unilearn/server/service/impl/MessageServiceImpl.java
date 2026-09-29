package com.unilearn.server.service.impl;

import com.unilearn.server.dto.request.MessageRequest;
import com.unilearn.server.dto.response.ContactResponse;
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
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
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
    @Transactional
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

        // Mark incoming messages as read
        List<Message> unread = messageRepository.findByReceiver_UserIdAndReadAtIsNull(user1Id);
        for (Message m : unread) {
            if (m.getSender() != null && m.getSender().getUserId().equals(user2Id)) {
                m.setReadAt(LocalDateTime.now());
                messageRepository.save(m);
            }
        }

        Page<Message> page = messageRepository.findConversation(user1Id, user2Id, pageable);
        List<MessageResponse> content = new ArrayList<>(page.getContent()
                .stream()
                .map(messageMapper::toMessageResponse)
                .toList());

        // Sort by time
        content.sort(Comparator.comparing(MessageResponse::getSentAt, Comparator.nullsLast(Comparator.naturalOrder())));

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

    @Override
    public List<ContactResponse> getContacts(Long userId) {
        if (userId == null) {
            throw new ValidationException("User ID cannot be null");
        }

        List<User> allUsers = userRepository.findAll();
        List<ContactResponse> contacts = new ArrayList<>();

        for (User u : allUsers) {
            if (u.getUserId().equals(userId)) continue;

            Page<Message> conv = messageRepository.findConversation(userId, u.getUserId(), PageRequest.of(0, 1));
            String lastMsg = null;
            String lastMsgTime = null;
            if (!conv.isEmpty()) {
                Message latest = conv.getContent().get(0);
                lastMsg = latest.getContent();
                lastMsgTime = latest.getSentAt() != null ? latest.getSentAt().toString() : null;
            }

            long unread = messageRepository.findByReceiver_UserIdAndReadAtIsNull(userId).stream()
                    .filter(m -> m.getSender() != null && m.getSender().getUserId().equals(u.getUserId()))
                    .count();

            String formattedRole = u.getRole() != null ? u.getRole().replace("_", " ").toLowerCase() : "member";
            formattedRole = Character.toUpperCase(formattedRole.charAt(0)) + formattedRole.substring(1);

            contacts.add(ContactResponse.builder()
                    .userId(u.getUserId())
                    .fullName(u.getFullName())
                    .email(u.getEmail())
                    .role(formattedRole)
                    .photoUrl(u.getPhotoUrl())
                    .lastMessage(lastMsg)
                    .lastMessageTime(lastMsgTime)
                    .unreadCount((int) unread)
                    .build());
        }

        contacts.sort((a, b) -> {
            if (a.getLastMessageTime() == null && b.getLastMessageTime() == null) {
                return a.getFullName().compareToIgnoreCase(b.getFullName());
            }
            if (a.getLastMessageTime() == null) return 1;
            if (b.getLastMessageTime() == null) return -1;
            return b.getLastMessageTime().compareTo(a.getLastMessageTime());
        });

        return contacts;
    }
}
