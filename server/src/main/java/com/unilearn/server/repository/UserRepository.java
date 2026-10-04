package com.unilearn.server.repository;

import com.unilearn.server.model.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@EnableJpaRepositories
public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);

    Optional<User> findByEmailIgnoreCase(String email);

    boolean existsByEmail(String email);

    boolean existsByEmailIgnoreCase(String email);

    boolean existsByRoleIgnoreCase(String role);

    List<User> findByRole(String role);

    List<User> findByStatus(String status);

    // user list for the admin page, empty search/status means no filter
    @Query("SELECT u FROM User u WHERE "
            + "(:search = '' OR LOWER(u.fullName) LIKE :search OR LOWER(u.email) LIKE :search) "
            + "AND (:allRoles = true OR LOWER(u.role) IN :roles) "
            + "AND (:status = '' "
            + "  OR (:status = 'active' AND LOWER(u.status) = 'active') "
            + "  OR (:status = 'inactive' AND (u.status IS NULL OR LOWER(u.status) <> 'active')))")
    Page<User> searchUsers(@Param("search") String search,
                           @Param("allRoles") boolean allRoles,
                           @Param("roles") List<String> roles,
                           @Param("status") String status,
                           Pageable pageable);
}
