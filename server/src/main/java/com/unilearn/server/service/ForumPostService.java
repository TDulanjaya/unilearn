package com.unilearn.server.service;

import com.unilearn.server.dto.request.ForumPostRequest;
import com.unilearn.server.dto.response.ForumPostResponse;
import com.unilearn.server.dto.response.PageResponseDTO;
import org.springframework.data.domain.Pageable;

/**
 * Service interface for managing forum posts.
 */
public interface ForumPostService {

    ForumPostResponse createPost(ForumPostRequest request);

    ForumPostResponse updatePost(Long postId, ForumPostRequest request);

    void deletePost(Long postId);

    ForumPostResponse getPostById(Long postId);

    PageResponseDTO<ForumPostResponse> getPostsByOffering(Long offeringId, Pageable pageable);
}
