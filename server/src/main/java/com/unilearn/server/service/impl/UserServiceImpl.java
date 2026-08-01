package com.unilearn.server.service.impl;

import com.unilearn.server.dto.request.UserRequest;
import com.unilearn.server.dto.response.PageResponseDTO;
import com.unilearn.server.dto.response.UserResponse;
import com.unilearn.server.exception.EntryNotFoundException;
import com.unilearn.server.exception.ValidationException;
import com.unilearn.server.model.User;
import com.unilearn.server.repository.UserRepository;
import com.unilearn.server.service.UserService;
import com.unilearn.server.util.mapper.UserMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final UserMapper userMapper;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public UserResponse createUser(UserRequest request) {
        if (request == null) {
            throw new ValidationException("User request cannot be null");
        }

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new com.unilearn.server.exception.DuplicateEntryException("Email already registered: " + request.getEmail());
        }

        String passwordHash = passwordEncoder.encode(request.getPassword() != null ? request.getPassword() : "defaultPass123");
        User user = userMapper.toUser(request, passwordHash);
        User saved = userRepository.save(user);
        return userMapper.toUserResponse(saved);
    }

    @Override
    @Transactional
    public UserResponse updateUser(Long userId, UserRequest request) {
        if (userId == null) {
            throw new ValidationException("User ID cannot be null");
        }
        if (request == null) {
            throw new ValidationException("User request cannot be null");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new EntryNotFoundException("User not found with ID: " + userId));

        if (!user.getEmail().equalsIgnoreCase(request.getEmail()) && userRepository.existsByEmail(request.getEmail())) {
            throw new com.unilearn.server.exception.DuplicateEntryException("Email already registered: " + request.getEmail());
        }

        user.setFullName(request.getFullName());
        user.setEmail(request.getEmail());
        user.setPhone(request.getPhone());
        user.setPhotoUrl(request.getPhotoUrl());
        user.setRole(request.getRole());
        if (request.getPassword() != null && !request.getPassword().isBlank()) {
            user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        }

        User updated = userRepository.save(user);
        return userMapper.toUserResponse(updated);
    }

    @Override
    @Transactional
    public void deleteUser(Long userId) {
        if (userId == null) {
            throw new ValidationException("User ID cannot be null");
        }
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new EntryNotFoundException("User not found with ID: " + userId));

        user.setStatus("inactive");
        userRepository.save(user);
    }

    @Override
    public UserResponse getUserById(Long userId) {
        if (userId == null) {
            throw new ValidationException("User ID cannot be null");
        }
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new EntryNotFoundException("User not found with ID: " + userId));
        return userMapper.toUserResponse(user);
    }

    @Override
    public PageResponseDTO<UserResponse> getAllUsers(Pageable pageable) {
        if (pageable == null) {
            throw new ValidationException("Pageable parameter cannot be null");
        }
        Page<User> page = userRepository.findAll(pageable);
        List<UserResponse> content = page.getContent()
                .stream()
                .map(userMapper::toUserResponse)
                .toList();

        return PageResponseDTO.<UserResponse>builder()
                .dataCount((int) page.getTotalElements())
                .dataList(content)
                .build();
    }

    @Override
    @Transactional
    public UserResponse setUserActive(Long userId, boolean active) {
        if (userId == null) {
            throw new ValidationException("User ID cannot be null");
        }
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new EntryNotFoundException("User not found with ID: " + userId));

        user.setStatus(active ? "active" : "inactive");
        User updated = userRepository.save(user);
        return userMapper.toUserResponse(updated);
    }
}
