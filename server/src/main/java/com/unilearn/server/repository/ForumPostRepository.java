package com.unilearn.server.repository;

import com.unilearn.server.model.ForumPost;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

import java.util.List;

@EnableJpaRepositories
public interface ForumPostRepository extends JpaRepository<ForumPost, Long> {

    List<ForumPost> findByCourseOffering_OfferingId(Long offeringId);

    Page<ForumPost> findByCourseOffering_OfferingId(Long offeringId, Pageable pageable);

    List<ForumPost> findByCourseOffering_OfferingIdAndParentPostIsNull(Long offeringId);

    List<ForumPost> findByParentPost_PostId(Long parentPostId);
}
