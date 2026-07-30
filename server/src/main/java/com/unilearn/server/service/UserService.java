package com.unilearn.server.service;

import com.unilearn.server.dto.request.UserRequest;
import com.unilearn.server.dto.response.PageResponseDTO;
import com.unilearn.server.dto.response.UserResponse;
import org.springframework.data.domain.Pageable;

/**
 * Service interface for managing users.
 */
public interface UserService {

    UserResponse createUser(UserRequest request);

    UserResponse updateUser(Long userId, UserRequest request);

    void deleteUser(Long userId);

    UserResponse getUserById(Long userId);

    PageResponseDTO<UserResponse> getAllUsers(Pageable pageable);

    UserResponse setUserActive(Long userId, boolean active);
}
