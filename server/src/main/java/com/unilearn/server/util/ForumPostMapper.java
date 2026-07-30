package com.unilearn.server.util;

import com.unilearn.server.dto.request.ForumPostRequest;
import com.unilearn.server.dto.response.ForumPostResponse;
import com.unilearn.server.exception.ValidationException;
import com.unilearn.server.model.CourseOffering;
import com.unilearn.server.model.ForumPost;
import com.unilearn.server.model.User;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Component
public class ForumPostMapper {

    public ForumPost toForumPost(ForumPostRequest request, CourseOffering offering, User author, ForumPost parentPost) {
        if (request == null) {
            throw new ValidationException("ForumPost request cannot be null");
        }
        return ForumPost.builder()
                .courseOffering(offering)
                .author(author)
                .parentPost(parentPost)
                .content(request.getContent())
                .postedAt(LocalDateTime.now())
                .build();
    }

    public ForumPostResponse toForumPostResponse(ForumPost post) {
        if (post == null) {
            throw new ValidationException("ForumPost cannot be null");
        }
        return ForumPostResponse.builder()
                .postId(post.getPostId())
                .offeringId(post.getCourseOffering() != null ? post.getCourseOffering().getOfferingId() : null)
                .authorId(post.getAuthor() != null ? post.getAuthor().getUserId() : null)
                .authorName(post.getAuthor() != null ? post.getAuthor().getFullName() : null)
                .content(post.getContent())
                .createdAt(post.getPostedAt())
                .postedAt(post.getPostedAt())
                .parentPostId(post.getParentPost() != null ? post.getParentPost().getPostId() : null)
                .build();
    }
}
