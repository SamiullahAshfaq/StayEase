package com.stayease.domain.user.repository;

import com.stayease.domain.user.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);

    Optional<User> findByPublicId(UUID publicId);

    boolean existsByEmail(String email);

    @Query("SELECT u FROM User u LEFT JOIN FETCH u.authorities ua LEFT JOIN FETCH ua.authority WHERE u.email = :email")
    Optional<User> findByEmailWithAuthorities(@Param("email") String email);

    @Query("SELECT u FROM User u LEFT JOIN FETCH u.authorities ua LEFT JOIN FETCH ua.authority WHERE u.publicId = :publicId")
    Optional<User> findByPublicIdWithAuthorities(@Param("publicId") UUID publicId);
}