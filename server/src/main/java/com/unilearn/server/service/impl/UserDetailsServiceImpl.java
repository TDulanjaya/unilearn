package com.unilearn.server.service.impl;

import com.unilearn.server.model.User;
import com.unilearn.server.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UserDetailsServiceImpl implements UserDetailsService {

    private final UserRepository userRepository;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        String normalized = username != null ? username.trim() : "";
        User user = userRepository.findByEmailIgnoreCase(normalized)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + username));
        return user;
    }
}
