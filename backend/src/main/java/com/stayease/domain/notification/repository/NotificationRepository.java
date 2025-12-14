package com.stayease.domain.notification.repository;

import com.stayease.domain.notification.entity.Notification;
import com.stayease.domain.notification.entity.Notification.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {

    // Find by public ID
    Optional<Notification> findByPublicId(String publicId);

    // Find all notifications for a user
    Page<Notification> findByUserPublicIdOrderByCreatedAtDesc(String userPublicId, Pageable pageable);

    // Find unread notifications for a user
    Page<Notification> findByUserPublicIdAndIsReadFalseOrderByCreatedAtDesc(String userPublicId, Pageable pageable);

    // Find by user and category
    Page<Notification> findByUserPublicIdAndCategoryOrderByCreatedAtDesc(
            String userPublicId,
            NotificationCategory category,
            Pageable pageable);

    // Find by user and type
    Page<Notification> findByUserPublicIdAndTypeOrderByCreatedAtDesc(
            String userPublicId,
            NotificationType type,
            Pageable pageable);

    // Find by user and priority
    Page<Notification> findByUserPublicIdAndPriorityOrderByCreatedAtDesc(
            String userPublicId,
            NotificationPriority priority,
            Pageable pageable);

    // Find archived notifications
    Page<Notification> findByUserPublicIdAndIsArchivedTrueOrderByArchivedAtDesc(
            String userPublicId,
            Pageable pageable);

    // Find non-archived notifications
    Page<Notification> findByUserPublicIdAndIsArchivedFalseOrderByCreatedAtDesc(
            String userPublicId,
            Pageable pageable);

    // Count unread notifications
    long countByUserPublicIdAndIsReadFalse(String userPublicId);

    // Count unread by category
    long countByUserPublicIdAndCategoryAndIsReadFalse(String userPublicId, NotificationCategory category);

    // Count unread by priority
    long countByUserPublicIdAndPriorityAndIsReadFalse(String userPublicId, NotificationPriority priority);

    // Find by related entity
    List<Notification> findByRelatedEntityTypeAndRelatedEntityId(String entityType, String entityId);

    // Find urgent unread notifications
    @Query("SELECT n FROM Notification n WHERE n.userPublicId = :userPublicId " +
            "AND n.priority = 'URGENT' AND n.isRead = false " +
            "ORDER BY n.createdAt DESC")
    List<Notification> findUrgentUnreadNotifications(@Param("userPublicId") String userPublicId);

    // Mark as read
    @Modifying
    @Query("UPDATE Notification n SET n.isRead = true, n.readAt = :readAt " +
            "WHERE n.publicId = :publicId")
    int markAsRead(@Param("publicId") String publicId, @Param("readAt") LocalDateTime readAt);

    // Mark all as read for user
    @Modifying
    @Query("UPDATE Notification n SET n.isRead = true, n.readAt = :readAt " +
            "WHERE n.userPublicId = :userPublicId AND n.isRead = false")
    int markAllAsRead(@Param("userPublicId") String userPublicId, @Param("readAt") LocalDateTime readAt);

    // Mark all by category as read
    @Modifying
    @Query("UPDATE Notification n SET n.isRead = true, n.readAt = :readAt " +
            "WHERE n.userPublicId = :userPublicId AND n.category = :category AND n.isRead = false")
    int markCategoryAsRead(
            @Param("userPublicId") String userPublicId,
            @Param("category") NotificationCategory category,
            @Param("readAt") LocalDateTime readAt);

    // Archive notification
    @Modifying
    @Query("UPDATE Notification n SET n.isArchived = true, n.archivedAt = :archivedAt " +
            "WHERE n.publicId = :publicId")
    int archiveNotification(@Param("publicId") String publicId, @Param("archivedAt") LocalDateTime archivedAt);

    // Unarchive notification
    @Modifying
    @Query("UPDATE Notification n SET n.isArchived = false, n.archivedAt = null " +
            "WHERE n.publicId = :publicId")
    int unarchiveNotification(@Param("publicId") String publicId);

    // Find expired notifications
    @Query("SELECT n FROM Notification n WHERE n.expiresAt < :now")
    List<Notification> findExpiredNotifications(@Param("now") LocalDateTime now);

    // Delete expired notifications
    @Modifying
    @Query("DELETE FROM Notification n WHERE n.expiresAt < :now")
    int deleteExpiredNotifications(@Param("now") LocalDateTime now);

    // Delete all for user (for account deletion)
    @Modifying
    @Query("DELETE FROM Notification n WHERE n.userPublicId = :userPublicId")
    int deleteAllByUserPublicId(@Param("userPublicId") String userPublicId);

    // Find recent notifications (last 7 days)
    @Query("SELECT n FROM Notification n WHERE n.userPublicId = :userPublicId " +
            "AND n.createdAt >= :since ORDER BY n.createdAt DESC")
    List<Notification> findRecentNotifications(
            @Param("userPublicId") String userPublicId,
            @Param("since") LocalDateTime since);

    // Complex filter query
    @Query("SELECT n FROM Notification n WHERE n.userPublicId = :userPublicId " +
            "AND (:isRead IS NULL OR n.isRead = :isRead) " +
            "AND (:category IS NULL OR n.category = :category) " +
            "AND (:priority IS NULL OR n.priority = :priority) " +
            "AND (:isArchived IS NULL OR n.isArchived = :isArchived) " +
            "ORDER BY n.createdAt DESC")
    Page<Notification> findByFilters(
            @Param("userPublicId") String userPublicId,
            @Param("isRead") Boolean isRead,
            @Param("category") NotificationCategory category,
            @Param("priority") NotificationPriority priority,
            @Param("isArchived") Boolean isArchived,
            Pageable pageable);
}
