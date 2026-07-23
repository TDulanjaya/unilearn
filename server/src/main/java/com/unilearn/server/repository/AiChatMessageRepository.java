package com.unilearn.server.repository;

import com.unilearn.server.model.AiChatMessage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AiChatMessageRepository extends JpaRepository<AiChatMessage, Long> {

    List<AiChatMessage> findByStudent_StudentId(Long studentId);

    List<AiChatMessage> findByStudent_StudentIdAndCourseOffering_OfferingId(Long studentId, Long offeringId);
}
