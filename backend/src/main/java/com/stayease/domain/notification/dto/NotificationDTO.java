package com.stayease.domain.notification.dto;

import com.stayease.domain.notification.entity.Notification.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.Map;

/**
 * Notification DTO for API responses
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NotificationDTO {

    private String publicId;
    private String userPublicId;
    private NotificationType type;
    private NotificationCategory category;
    private NotificationPriority priority;

    private String title;
    private String message;

    // Related entity
    private String relatedEntityType;
    private String relatedEntityId;

    // Actor (who triggered the notification)
    private String actorPublicId;
    private String actorName;
    private String actorAvatarUrl;

    // Action
    private String actionUrl;
    private String actionLabel;

    // Status
    private Boolean isRead;
    private LocalDateTime readAt;
    private Boolean isArchived;
    private LocalDateTime archivedAt;

    // Delivery status
    private Boolean sentInApp;
    private Boolean sentEmail;
    private LocalDateTime emailSentAt;
    private Boolean sentPush;
    private LocalDateTime pushSentAt;

    // Additional data
    private Map<String, String> metadata;

    // Media
    private String imageUrl;
    private String iconUrl;

    // Timestamps
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime expiresAt;

    // Computed fields
    private String timeAgo; // "2 hours ago", "Just now", etc.
    private Boolean isExpired;
}
