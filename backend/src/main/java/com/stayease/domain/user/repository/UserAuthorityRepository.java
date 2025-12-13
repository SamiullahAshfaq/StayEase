package com.stayease.domain.user.repository;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.stayease.domain.user.entity.UserAuthority;

@Repository
public interface UserAuthorityRepository extends JpaRepository<UserAuthority, Long> {

    @org.springframework.data.jpa.repository.Query("SELECT ua FROM UserAuthority ua WHERE ua.user.publicId = :publicId")
    List<UserAuthority> findByUserPublicId(@org.springframework.data.repository.query.Param("publicId") UUID publicId);

    @org.springframework.data.jpa.repository.Modifying
    @org.springframework.data.jpa.repository.Query("DELETE FROM UserAuthority ua WHERE ua.user.publicId = :publicId AND ua.authority.name = :authorityName")
    void deleteByUserPublicIdAndAuthorityName(@org.springframework.data.repository.query.Param("publicId") UUID publicId, @org.springframework.data.repository.query.Param("authorityName") String authorityName);
}