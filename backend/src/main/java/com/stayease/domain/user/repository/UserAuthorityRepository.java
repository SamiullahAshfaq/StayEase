package com.stayease.domain.user.repository;

import com.stayease.domain.user.entity.UserAuthority;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface UserAuthorityRepository extends JpaRepository<UserAuthority, UserAuthority.UserAuthorityId> {
}