package com.unilearn.server.repository;

import com.unilearn.server.model.SuperAdminOtpChallenge;
import com.unilearn.server.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.Optional;

public interface SuperAdminOtpChallengeRepository extends JpaRepository<SuperAdminOtpChallenge, Long> {

    Optional<SuperAdminOtpChallenge> findByChallengeToken(String challengeToken);

    @Modifying
    @Query("UPDATE SuperAdminOtpChallenge c SET c.expiresAt = :now WHERE c.user = :user AND c.usedAt IS NULL AND c.expiresAt > :now")
    void invalidateActiveChallenges(@Param("user") User user, @Param("now") LocalDateTime now);
}
