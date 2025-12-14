package com.stayease.domain.notification.dto;

import com.stayease.domain.notification.entity.Notification.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

/**
 * DTO for creating new notifications
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateNotificationDTO {

    @NotBlank(message = "User public ID is required")
    private String userPublicId;

    @NotNull(message = "Notification type is required")
    private NotificationType type;

    @NotNull(message = "Category is required")
    private NotificationCategory category;

    @NotNull(message = "Priority is required")
    @Builder.Default
    private NotificationPriority priority = NotificationPriority.NORMAL;

    @NotBlank(message = "Title is required")
    @Size(max = 200, message = "Title must not exceed 200 characters")
    private String title;

    @NotBlank(message = "Message is required")
    @Size(max = 1000, message = "Message must not exceed 1000 characters")
    private String message;

    // Related entity
    private String relatedEntityType;
    private String relatedEntityId;

    // Actor information
    private String actorPublicId;
    private String actorName;
    private String actorAvatarUrl;

    // Action details
    private String actionUrl;
    private String actionLabel;

    // Delivery preferences
    @Builder.Default
    private Boolean sendInApp = true;

    @Builder.Default
    private Boolean sendEmail = false;

    @Builder.Default
    private Boolean sendPush = false;

    // Additional data
    private Map<String, String> metadata;

    // Media
    private String imageUrl;
    private String iconUrl;
}
