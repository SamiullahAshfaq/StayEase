package com.stayease.domain.user.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.stayease.domain.user.entity.User;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByPublicId(UUID publicId);

    Optional<User> findByEmail(String email);

    Optional<User> findByOauthProviderAndOauthProviderId(String oauthProvider, String oauthProviderId);

    boolean existsByEmail(String email);

    @Query("SELECT u FROM User u JOIN FETCH u.userAuthorities ua JOIN FETCH ua.authority WHERE u.publicId = :publicId")
    Optional<User> findByIdWithAuthorities(@Param("publicId") UUID publicId);

    @Query("SELECT u FROM User u JOIN FETCH u.userAuthorities ua JOIN FETCH ua.authority WHERE u.email = :email")
    Optional<User> findByEmailWithAuthorities(@Param("email") String email);

    List<User> findByIsActiveTrue();

    @Query("SELECT u FROM User u JOIN u.userAuthorities ua WHERE ua.authority.name = :authorityName")
    List<User> findByAuthorityName(@Param("authorityName") String authorityName);

    Optional<User> findByStripeCustomerId(String stripeCustomerId);

    Optional<User> findByStripeAccountId(String stripeAccountId);
}