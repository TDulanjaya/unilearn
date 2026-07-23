package com.unilearn.server.repository;

import com.unilearn.server.model.Message;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MessageRepository extends JpaRepository<Message, Long> {

    List<Message> findBySender_UserIdAndReceiver_UserId(Long senderId, Long receiverId);

    List<Message> findByReceiver_UserIdAndReadAtIsNull(Long receiverId);
}
