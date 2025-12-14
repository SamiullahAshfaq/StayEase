package com.stayease.domain.notification.service;

import com.stayease.domain.notification.dto.CreateNotificationDTO;
import com.stayease.domain.notification.dto.NotificationDTO;
import com.stayease.domain.notification.dto.UpdateNotificationDTO;
import com.stayease.domain.notification.entity.Notification;
import com.stayease.domain.notification.entity.Notification.*;
import com.stayease.domain.notification.repository.NotificationRepository;
import com.stayease.exception.NotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class NotificationService {

    private final NotificationRepository notificationRepository;
    // TODO: Inject EmailService, PushNotificationService, WebSocketService when
    // available

    /**
     * Create a new notification
     */
    public NotificationDTO createNotification(CreateNotificationDTO dto) {
        log.info("Creating notification for user: {}, type: {}", dto.getUserPublicId(), dto.getType());

        Notification notification = Notification.builder()
                .publicId(UUID.randomUUID().toString())
                .userPublicId(dto.getUserPublicId())
                .type(dto.getType())
                .category(dto.getCategory())
                .priority(dto.getPriority() != null ? dto.getPriority() : NotificationPriority.NORMAL)
                .title(dto.getTitle())
                .message(dto.getMessage())
                .relatedEntityType(dto.getRelatedEntityType())
                .relatedEntityId(dto.getRelatedEntityId())
                .actorPublicId(dto.getActorPublicId())
                .actorName(dto.getActorName())
                .actorAvatarUrl(dto.getActorAvatarUrl())
                .actionUrl(dto.getActionUrl())
                .actionLabel(dto.getActionLabel())
                .imageUrl(dto.getImageUrl())
                .iconUrl(dto.getIconUrl())
                .isRead(false)
                .isArchived(false)
                .sentInApp(dto.getSendInApp() != null ? dto.getSendInApp() : true)
                .sentEmail(false)
                .sentPush(false)
                .expiresAt(LocalDateTime.now().plusDays(90))
                .build();

        // Add metadata
        if (dto.getMetadata() != null) {
            dto.getMetadata().forEach(notification::addMetadata);
        }

        notification = notificationRepository.save(notification);

        // Send through different channels asynchronously
        if (dto.getSendEmail() != null && dto.getSendEmail()) {
            sendEmailNotification(notification);
        }

        if (dto.getSendPush() != null && dto.getSendPush()) {
            sendPushNotification(notification);
        }

        // Always send real-time in-app notification
        sendRealTimeNotification(notification);

        log.info("Notification created with ID: {}", notification.getPublicId());
        return mapToDTO(notification);
    }

    /**
     * Get notification by public ID
     */
    @Transactional(readOnly = true)
    public NotificationDTO getNotification(String publicId) {
        Notification notification = notificationRepository.findByPublicId(publicId)
                .orElseThrow(() -> new NotFoundException("Notification not found with ID: " + publicId));
        return mapToDTO(notification);
    }

    /**
     * Get all notifications for a user
     */
    @Transactional(readOnly = true)
    public Page<NotificationDTO> getUserNotifications(String userPublicId, Pageable pageable) {
        Page<Notification> notifications = notificationRepository
                .findByUserPublicIdOrderByCreatedAtDesc(userPublicId, pageable);
        return notifications.map(this::mapToDTO);
    }

    /**
     * Get unread notifications for a user
     */
    @Transactional(readOnly = true)
    public Page<NotificationDTO> getUnreadNotifications(String userPublicId, Pageable pageable) {
        Page<Notification> notifications = notificationRepository
                .findByUserPublicIdAndIsReadFalseOrderByCreatedAtDesc(userPublicId, pageable);
        return notifications.map(this::mapToDTO);
    }

    /**
     * Get notifications by category
     */
    @Transactional(readOnly = true)
    public Page<NotificationDTO> getNotificationsByCategory(
            String userPublicId,
            NotificationCategory category,
            Pageable pageable) {
        Page<Notification> notifications = notificationRepository
                .findByUserPublicIdAndCategoryOrderByCreatedAtDesc(userPublicId, category, pageable);
        return notifications.map(this::mapToDTO);
    }

    /**
     * Get notifications by priority
     */
    @Transactional(readOnly = true)
    public Page<NotificationDTO> getNotificationsByPriority(
            String userPublicId,
            NotificationPriority priority,
            Pageable pageable) {
        Page<Notification> notifications = notificationRepository
                .findByUserPublicIdAndPriorityOrderByCreatedAtDesc(userPublicId, priority, pageable);
        return notifications.map(this::mapToDTO);
    }

    /**
     * Get archived notifications
     */
    @Transactional(readOnly = true)
    public Page<NotificationDTO> getArchivedNotifications(String userPublicId, Pageable pageable) {
        Page<Notification> notifications = notificationRepository
                .findByUserPublicIdAndIsArchivedTrueOrderByArchivedAtDesc(userPublicId, pageable);
        return notifications.map(this::mapToDTO);
    }

    /**
     * Get notifications with filters
     */
    @Transactional(readOnly = true)
    public Page<NotificationDTO> getFilteredNotifications(
            String userPublicId,
            Boolean isRead,
            NotificationCategory category,
            NotificationPriority priority,
            Boolean isArchived,
            Pageable pageable) {
        Page<Notification> notifications = notificationRepository.findByFilters(
                userPublicId, isRead, category, priority, isArchived, pageable);
        return notifications.map(this::mapToDTO);
    }

    /**
     * Get unread count
     */
    @Transactional(readOnly = true)
    public long getUnreadCount(String userPublicId) {
        return notificationRepository.countByUserPublicIdAndIsReadFalse(userPublicId);
    }

    /**
     * Get unread count by category
     */
    @Transactional(readOnly = true)
    public long getUnreadCountByCategory(String userPublicId, NotificationCategory category) {
        return notificationRepository.countByUserPublicIdAndCategoryAndIsReadFalse(userPublicId, category);
    }

    /**
     * Get urgent unread notifications
     */
    @Transactional(readOnly = true)
    public List<NotificationDTO> getUrgentUnreadNotifications(String userPublicId) {
        List<Notification> notifications = notificationRepository
                .findUrgentUnreadNotifications(userPublicId);
        return notifications.stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Get recent notifications (last 7 days)
     */
    @Transactional(readOnly = true)
    public List<NotificationDTO> getRecentNotifications(String userPublicId) {
        LocalDateTime since = LocalDateTime.now().minusDays(7);
        List<Notification> notifications = notificationRepository
                .findRecentNotifications(userPublicId, since);
        return notifications.stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Mark notification as read
     */
    public NotificationDTO markAsRead(String publicId) {
        Notification notification = notificationRepository.findByPublicId(publicId)
                .orElseThrow(() -> new NotFoundException("Notification not found with ID: " + publicId));

        notification.markAsRead();
        notification = notificationRepository.save(notification);

        log.info("Notification {} marked as read", publicId);
        return mapToDTO(notification);
    }

    /**
     * Mark all notifications as read for a user
     */
    public int markAllAsRead(String userPublicId) {
        int count = notificationRepository.markAllAsRead(userPublicId, LocalDateTime.now());
        log.info("Marked {} notifications as read for user {}", count, userPublicId);
        return count;
    }

    /**
     * Mark all notifications in a category as read
     */
    public int markCategoryAsRead(String userPublicId, NotificationCategory category) {
        int count = notificationRepository.markCategoryAsRead(userPublicId, category, LocalDateTime.now());
        log.info("Marked {} {} notifications as read for user {}", count, category, userPublicId);
        return count;
    }

    /**
     * Archive notification
     */
    public NotificationDTO archiveNotification(String publicId) {
        Notification notification = notificationRepository.findByPublicId(publicId)
                .orElseThrow(() -> new NotFoundException("Notification not found with ID: " + publicId));

        notification.archive();
        notification = notificationRepository.save(notification);

        log.info("Notification {} archived", publicId);
        return mapToDTO(notification);
    }

    /**
     * Unarchive notification
     */
    public NotificationDTO unarchiveNotification(String publicId) {
        Notification notification = notificationRepository.findByPublicId(publicId)
                .orElseThrow(() -> new NotFoundException("Notification not found with ID: " + publicId));

        notification.setIsArchived(false);
        notification.setArchivedAt(null);
        notification = notificationRepository.save(notification);

        log.info("Notification {} unarchived", publicId);
        return mapToDTO(notification);
    }

    /**
     * Update notification
     */
    public NotificationDTO updateNotification(String publicId, UpdateNotificationDTO dto) {
        Notification notification = notificationRepository.findByPublicId(publicId)
                .orElseThrow(() -> new NotFoundException("Notification not found with ID: " + publicId));

        if (dto.getIsRead() != null) {
            if (dto.getIsRead()) {
                notification.markAsRead();
            } else {
                notification.setIsRead(false);
                notification.setReadAt(null);
            }
        }

        if (dto.getIsArchived() != null) {
            if (dto.getIsArchived()) {
                notification.archive();
            } else {
                notification.setIsArchived(false);
                notification.setArchivedAt(null);
            }
        }

        if (dto.getMetadata() != null) {
            dto.getMetadata().forEach(notification::addMetadata);
        }

        notification = notificationRepository.save(notification);
        return mapToDTO(notification);
    }

    /**
     * Delete notification
     */
    public void deleteNotification(String publicId) {
        Notification notification = notificationRepository.findByPublicId(publicId)
                .orElseThrow(() -> new NotFoundException("Notification not found with ID: " + publicId));

        notificationRepository.delete(notification);
        log.info("Notification {} deleted", publicId);
    }

    /**
     * Delete all notifications for a user (for account deletion)
     */
    public int deleteAllUserNotifications(String userPublicId) {
        int count = notificationRepository.deleteAllByUserPublicId(userPublicId);
        log.info("Deleted {} notifications for user {}", count, userPublicId);
        return count;
    }

    /**
     * Clean up expired notifications (scheduled task)
     */
    public int cleanupExpiredNotifications() {
        int count = notificationRepository.deleteExpiredNotifications(LocalDateTime.now());
        log.info("Cleaned up {} expired notifications", count);
        return count;
    }

    /**
     * Send email notification (async)
     */
    @Async
    protected void sendEmailNotification(Notification notification) {
        try {
            log.info("Sending email notification: {}", notification.getPublicId());
            // TODO: Integrate with EmailService
            // emailService.sendNotificationEmail(notification);

            notification.setSentEmail(true);
            notification.setEmailSentAt(LocalDateTime.now());
            notificationRepository.save(notification);
        } catch (Exception e) {
            log.error("Failed to send email notification: {}", e.getMessage());
        }
    }

    /**
     * Send push notification (async)
     */
    @Async
    protected void sendPushNotification(Notification notification) {
        try {
            log.info("Sending push notification: {}", notification.getPublicId());
            // TODO: Integrate with PushNotificationService
            // pushNotificationService.send(notification);

            notification.setSentPush(true);
            notification.setPushSentAt(LocalDateTime.now());
            notificationRepository.save(notification);
        } catch (Exception e) {
            log.error("Failed to send push notification: {}", e.getMessage());
        }
    }

    /**
     * Send real-time notification via WebSocket (async)
     */
    @Async
    protected void sendRealTimeNotification(Notification notification) {
        try {
            log.info("Sending real-time notification: {}", notification.getPublicId());
            // TODO: Integrate with WebSocketService
            // webSocketService.sendNotification(notification.getUserPublicId(),
            // mapToDTO(notification));
        } catch (Exception e) {
            log.error("Failed to send real-time notification: {}", e.getMessage());
        }
    }

    /**
     * Map entity to DTO
     */
    private NotificationDTO mapToDTO(Notification notification) {
        String timeAgo = calculateTimeAgo(notification.getCreatedAt());

        return NotificationDTO.builder()
                .publicId(notification.getPublicId())
                .userPublicId(notification.getUserPublicId())
                .type(notification.getType())
                .category(notification.getCategory())
                .priority(notification.getPriority())
                .title(notification.getTitle())
                .message(notification.getMessage())
                .relatedEntityType(notification.getRelatedEntityType())
                .relatedEntityId(notification.getRelatedEntityId())
                .actorPublicId(notification.getActorPublicId())
                .actorName(notification.getActorName())
                .actorAvatarUrl(notification.getActorAvatarUrl())
                .actionUrl(notification.getActionUrl())
                .actionLabel(notification.getActionLabel())
                .imageUrl(notification.getImageUrl())
                .iconUrl(notification.getIconUrl())
                .isRead(notification.getIsRead())
                .readAt(notification.getReadAt())
                .isArchived(notification.getIsArchived())
                .archivedAt(notification.getArchivedAt())
                .sentInApp(notification.getSentInApp())
                .sentEmail(notification.getSentEmail())
                .emailSentAt(notification.getEmailSentAt())
                .sentPush(notification.getSentPush())
                .pushSentAt(notification.getPushSentAt())
                .metadata(notification.getMetadata())
                .createdAt(notification.getCreatedAt())
                .updatedAt(notification.getUpdatedAt())
                .expiresAt(notification.getExpiresAt())
                .timeAgo(timeAgo)
                .isExpired(notification.isExpired())
                .build();
    }

    /**
     * Calculate human-readable time ago
     */
    private String calculateTimeAgo(LocalDateTime createdAt) {
        if (createdAt == null)
            return "Unknown";

        LocalDateTime now = LocalDateTime.now();
        long minutes = ChronoUnit.MINUTES.between(createdAt, now);

        if (minutes < 1)
            return "Just now";
        if (minutes < 60)
            return minutes + (minutes == 1 ? " minute ago" : " minutes ago");

        long hours = ChronoUnit.HOURS.between(createdAt, now);
        if (hours < 24)
            return hours + (hours == 1 ? " hour ago" : " hours ago");

        long days = ChronoUnit.DAYS.between(createdAt, now);
        if (days < 7)
            return days + (days == 1 ? " day ago" : " days ago");

        long weeks = days / 7;
        if (weeks < 4)
            return weeks + (weeks == 1 ? " week ago" : " weeks ago");

        long months = ChronoUnit.MONTHS.between(createdAt, now);
        if (months < 12)
            return months + (months == 1 ? " month ago" : " months ago");

        long years = ChronoUnit.YEARS.between(createdAt, now);
        return years + (years == 1 ? " year ago" : " years ago");
    }
}
