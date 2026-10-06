package com.unilearn.server.config;

import com.unilearn.server.security.JwtAuthenticationFilter;
import com.unilearn.server.service.impl.UserDetailsServiceImpl;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfigurationSource;

import org.springframework.core.env.Environment;
import java.util.Arrays;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final UserDetailsServiceImpl userDetailsServiceImpl;
    private final CorsConfigurationSource corsConfigurationSource;
    private final JwtAuthenticationFilter jwtAuthenticationFilter;
    private final com.unilearn.server.security.AuthRateLimitFilter authRateLimitFilter;
    private final Environment environment;

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder(12);
    }

    @Bean
    public DaoAuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider provider = new DaoAuthenticationProvider(userDetailsServiceImpl);
        provider.setPasswordEncoder(passwordEncoder());
        return provider;
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        boolean isDevProfile = Arrays.asList(environment.getActiveProfiles()).contains("dev");

        http
                .csrf(csrf -> csrf.disable())
                .cors(cors -> cors.configurationSource(corsConfigurationSource))
                .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .exceptionHandling(ex -> ex
                        .authenticationEntryPoint((request, response, authException) -> {
                            response.setContentType("application/json");
                            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                            response.getWriter().write("{\"error\": \"Unauthorized\", \"message\": \"" + authException.getMessage() + "\"}");
                        })
                        .accessDeniedHandler((request, response, accessDeniedException) -> {
                            response.setContentType("application/json");
                            response.setStatus(HttpServletResponse.SC_FORBIDDEN);
                            response.getWriter().write("{\"error\": \"Forbidden\", \"message\": \"Access Denied\"}");
                        })
                )
                .authorizeHttpRequests(auth -> {
                    auth
                            .requestMatchers("/", "/health", "/api/health", "/api/v1/health", "/api/v1/health/**").permitAll()
                            .requestMatchers("/api/v1/auth/login", "/api/v1/auth/register", "/api/v1/auth/refresh", "/api/v1/auth/logout",
                                    "/api/v1/auth/superadmin/verify-otp").permitAll()
                            .requestMatchers(org.springframework.http.HttpMethod.GET, "/api/v1/events/**").permitAll()
                            .requestMatchers(org.springframework.http.HttpMethod.GET, "/api/v1/faculties/public").permitAll()
                            .requestMatchers(org.springframework.http.HttpMethod.GET,
                                    "/api/v1/files/download/events_*", "/api/v1/files/download/avatars_*").permitAll();

                    if (isDevProfile) {
                        auth.requestMatchers("/swagger-ui/**", "/v3/api-docs/**").permitAll();
                    } else {
                        auth.requestMatchers("/swagger-ui/**", "/v3/api-docs/**").denyAll();
                    }

                    auth.anyRequest().authenticated();
                })
                .addFilterBefore(authRateLimitFilter, UsernamePasswordAuthenticationFilter.class)
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}
