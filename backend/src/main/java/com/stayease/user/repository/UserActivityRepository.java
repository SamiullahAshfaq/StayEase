package com.stayease.user.repository;

import com.stayease.user.entity.ActivityType;
import com.stayease.user.entity.User;
import com.stayease.user.entity.UserActivity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface UserActivityRepository extends JpaRepository<UserActivity, Long> {

    Page<UserActivity> findByUserOrderByCreatedAtDesc(User user, Pageable pageable);

    Page<UserActivity> findByUserIdOrderByCreatedAtDesc(Long userId, Pageable pageable);

    List<UserActivity> findByUserAndActivityType(User user, ActivityType activityType);

    @Query("SELECT ua FROM UserActivity ua WHERE ua.user.id = :userId " +
            "AND ua.createdAt BETWEEN :startDate AND :endDate " +
            "ORDER BY ua.createdAt DESC")
    Page<UserActivity> findByUserIdAndDateRange(
            @Param("userId") Long userId,
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate,
            Pageable pageable);

    @Query("SELECT ua FROM UserActivity ua WHERE ua.user.id = :userId " +
            "AND ua.activityType = :activityType " +
            "ORDER BY ua.createdAt DESC")
    Page<UserActivity> findByUserIdAndActivityType(
            @Param("userId") Long userId,
            @Param("activityType") ActivityType activityType,
            Pageable pageable);

    Long countByUser(User user);

    Long countByUserAndActivityType(User user, ActivityType activityType);
}
