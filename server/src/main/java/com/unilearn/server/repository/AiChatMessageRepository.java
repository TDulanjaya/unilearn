package com.unilearn.server.repository;

import com.unilearn.server.model.AiChatMessage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

import java.util.List;

@EnableJpaRepositories
public interface AiChatMessageRepository extends JpaRepository<AiChatMessage, Long> {

    List<AiChatMessage> findByStudent_StudentId(Long studentId);

    List<AiChatMessage> findByStudent_StudentIdAndCourseOffering_OfferingId(Long studentId, Long offeringId);

    List<AiChatMessage> findByStudent_StudentIdAndCourseOffering_OfferingIdOrderByCreatedAtAsc(Long studentId, Long offeringId);

    long countByStudent_StudentIdAndRoleAndCreatedAtGreaterThanEqual(Long studentId, String role, java.time.LocalDateTime since);
}
