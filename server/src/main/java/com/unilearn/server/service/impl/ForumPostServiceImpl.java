package com.unilearn.server.service.impl;

import com.unilearn.server.dto.request.ForumPostRequest;
import com.unilearn.server.dto.response.ForumPostResponse;
import com.unilearn.server.dto.response.PageResponseDTO;
import com.unilearn.server.exception.EntryNotFoundException;
import com.unilearn.server.exception.ValidationException;
import com.unilearn.server.model.CourseOffering;
import com.unilearn.server.model.ForumPost;
import com.unilearn.server.model.User;
import com.unilearn.server.repository.CourseOfferingRepository;
import com.unilearn.server.repository.ForumPostRepository;
import com.unilearn.server.repository.UserRepository;
import com.unilearn.server.service.ForumPostService;
import com.unilearn.server.util.mapper.ForumPostMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ForumPostServiceImpl implements ForumPostService {

    private final ForumPostRepository forumPostRepository;
    private final CourseOfferingRepository courseOfferingRepository;
    private final UserRepository userRepository;
    private final ForumPostMapper forumPostMapper;

    @Override
    @Transactional
    public ForumPostResponse createPost(ForumPostRequest request) {
        if (request == null) {
            throw new ValidationException("ForumPost request cannot be null");
        }

        CourseOffering offering = courseOfferingRepository.findById(request.getOfferingId())
                .orElseThrow(() -> new EntryNotFoundException("CourseOffering not found with ID: " + request.getOfferingId()));

        User author = userRepository.findById(request.getAuthorId())
                .orElseThrow(() -> new EntryNotFoundException("User not found with ID: " + request.getAuthorId()));

        ForumPost parentPost = null;
        if (request.getParentPostId() != null) {
            parentPost = forumPostRepository.findById(request.getParentPostId())
                    .orElseThrow(() -> new EntryNotFoundException("Parent ForumPost not found with ID: " + request.getParentPostId()));
        }

        ForumPost post = forumPostMapper.toForumPost(request, offering, author, parentPost);
        ForumPost saved = forumPostRepository.save(post);
        return forumPostMapper.toForumPostResponse(saved);
    }

    @Override
    @Transactional
    public ForumPostResponse updatePost(Long postId, ForumPostRequest request) {
        if (postId == null) {
            throw new ValidationException("Post ID cannot be null");
        }
        if (request == null) {
            throw new ValidationException("ForumPost request cannot be null");
        }

        ForumPost post = forumPostRepository.findById(postId)
                .orElseThrow(() -> new EntryNotFoundException("ForumPost not found with ID: " + postId));

        post.setContent(request.getContent());

        ForumPost updated = forumPostRepository.save(post);
        return forumPostMapper.toForumPostResponse(updated);
    }

    @Override
    @Transactional
    public void deletePost(Long postId) {
        if (postId == null) {
            throw new ValidationException("Post ID cannot be null");
        }
        if (!forumPostRepository.existsById(postId)) {
            throw new EntryNotFoundException("ForumPost not found with ID: " + postId);
        }
        forumPostRepository.deleteById(postId);
    }

    @Override
    public ForumPostResponse getPostById(Long postId) {
        if (postId == null) {
            throw new ValidationException("Post ID cannot be null");
        }
        ForumPost post = forumPostRepository.findById(postId)
                .orElseThrow(() -> new EntryNotFoundException("ForumPost not found with ID: " + postId));
        return forumPostMapper.toForumPostResponse(post);
    }

    @Override
    public PageResponseDTO<ForumPostResponse> getPostsByOffering(Long offeringId, Pageable pageable) {
        if (offeringId == null) {
            throw new ValidationException("Offering ID cannot be null");
        }
        if (pageable == null) {
            throw new ValidationException("Pageable parameter cannot be null");
        }
        if (!courseOfferingRepository.existsById(offeringId)) {
            throw new EntryNotFoundException("CourseOffering not found with ID: " + offeringId);
        }

        Page<ForumPost> page = forumPostRepository.findByCourseOffering_OfferingId(offeringId, pageable);
        List<ForumPostResponse> content = page.getContent()
                .stream()
                .map(forumPostMapper::toForumPostResponse)
                .toList();

        return PageResponseDTO.<ForumPostResponse>builder()
                .dataCount((int) page.getTotalElements())
                .dataList(content)
                .build();
    }
}
