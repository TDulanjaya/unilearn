package com.unilearn.server.repository;

import com.unilearn.server.model.ForumPost;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ForumPostRepository extends JpaRepository<ForumPost, Long> {

    List<ForumPost> findByCourseOffering_OfferingId(Long offeringId);

    List<ForumPost> findByCourseOffering_OfferingIdAndParentPostIsNull(Long offeringId);

    List<ForumPost> findByParentPost_PostId(Long parentPostId);
}
