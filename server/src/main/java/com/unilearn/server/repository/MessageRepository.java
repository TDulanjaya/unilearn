package com.unilearn.server.repository;

import com.unilearn.server.model.Message;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.data.repository.query.Param;

import java.util.List;

@EnableJpaRepositories
public interface MessageRepository extends JpaRepository<Message, Long> {

    List<Message> findBySender_UserIdAndReceiver_UserId(Long senderId, Long receiverId);

    @Query("SELECT m FROM Message m WHERE (m.sender.userId = :user1Id AND m.receiver.userId = :user2Id) OR (m.sender.userId = :user2Id AND m.receiver.userId = :user1Id) ORDER BY m.sentAt DESC")
    Page<Message> findConversation(@Param("user1Id") Long user1Id, @Param("user2Id") Long user2Id, Pageable pageable);

    List<Message> findByReceiver_UserIdAndReadAtIsNull(Long receiverId);
}
