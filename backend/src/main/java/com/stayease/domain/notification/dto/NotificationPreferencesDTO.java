package com.stayease.domain.notification.dto;

import com.stayease.domain.notification.entity.Notification.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.HashMap;
import java.util.Map;

/**
 * DTO for user notification preferences
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NotificationPreferencesDTO {

    private String userPublicId;

    // Global preferences
    @Builder.Default
    private Boolean emailEnabled = true;

    @Builder.Default
    private Boolean pushEnabled = true;

    @Builder.Default
    private Boolean inAppEnabled = true;

    // Category-specific preferences
    @Builder.Default
    private Map<NotificationCategory, ChannelPreferences> categoryPreferences = new HashMap<>();

    // Type-specific overrides
    @Builder.Default
    private Map<NotificationType, ChannelPreferences> typePreferences = new HashMap<>();

    // Quiet hours
    private QuietHours quietHours;

    // Digest preferences
    @Builder.Default
    private Boolean enableDailyDigest = false;

    @Builder.Default
    private Boolean enableWeeklyDigest = false;

    /**
     * Channel preferences for a specific category or type
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ChannelPreferences {
        @Builder.Default
        private Boolean email = true;

        @Builder.Default
        private Boolean push = true;

        @Builder.Default
        private Boolean inApp = true;
    }

    /**
     * Quiet hours configuration
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class QuietHours {
        @Builder.Default
        private Boolean enabled = false;

        private String startTime; // HH:mm format
        private String endTime; // HH:mm format

        @Builder.Default
        private Boolean allowUrgent = true;
    }
}
