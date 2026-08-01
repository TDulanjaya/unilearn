package com.unilearn.server.util.mapper;

import com.unilearn.server.dto.request.MessageRequest;
import com.unilearn.server.dto.response.MessageResponse;
import com.unilearn.server.exception.ValidationException;
import com.unilearn.server.model.Message;
import com.unilearn.server.model.User;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Component
public class MessageMapper {

    public Message toMessage(MessageRequest request, User sender, User receiver) {
        if (request == null) {
            throw new ValidationException("Message request cannot be null");
        }
        return Message.builder()
                .sender(sender)
                .receiver(receiver)
                .content(request.getContent())
                .sentAt(LocalDateTime.now())
                .build();
    }

    public MessageResponse toMessageResponse(Message message) {
        if (message == null) {
            throw new ValidationException("Message cannot be null");
        }
        return MessageResponse.builder()
                .messageId(message.getMessageId())
                .senderId(message.getSender() != null ? message.getSender().getUserId() : null)
                .senderName(message.getSender() != null ? message.getSender().getFullName() : null)
                .recipientId(message.getReceiver() != null ? message.getReceiver().getUserId() : null)
                .receiverId(message.getReceiver() != null ? message.getReceiver().getUserId() : null)
                .recipientName(message.getReceiver() != null ? message.getReceiver().getFullName() : null)
                .receiverName(message.getReceiver() != null ? message.getReceiver().getFullName() : null)
                .content(message.getContent())
                .sentAt(message.getSentAt())
                .readAt(message.getReadAt())
                .isRead(message.getReadAt() != null)
                .build();
    }
}
