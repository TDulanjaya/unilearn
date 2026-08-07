package com.unilearn.server.service;

import com.unilearn.server.dto.response.UserResponse;

public interface ProfileService {

    UserResponse getProfile(Long userId);

    UserResponse updatePhoto(Long userId, String photoUrl);
}
