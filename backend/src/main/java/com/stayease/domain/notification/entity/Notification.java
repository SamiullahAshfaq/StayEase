package com.stayease.domain.notification.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

/**
 * Notification entity - Airbnb-like notification system
 * Handles in-app notifications, email notifications, and push notifications
 */
@Entity
@Table(name = "notifications", indexes = {
        @Index(name = "idx_user_public_id", columnList = "userPublicId"),
        @Index(name = "idx_notification_type", columnList = "type"),
        @Index(name = "idx_is_read", columnList = "isRead"),
        @Index(name = "idx_created_at", columnList = "createdAt"),
        @Index(name = "idx_user_read", columnList = "userPublicId,isRead")
})
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "notification_seq")
    @SequenceGenerator(name = "notification_seq", sequenceName = "notification_sequence", allocationSize = 1)
    private Long id;

    @Column(nullable = false, unique = true, updatable = false)
    private String publicId;

    @Column(nullable = false)
    private String userPublicId; // Recipient user

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private NotificationType type;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private NotificationCategory category;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private NotificationPriority priority;

    @Column(nullable = false, length = 200)
    private String title;

    @Column(nullable = false, length = 1000)
    private String message;

    // Related entity information
    private String relatedEntityType; // BOOKING, LISTING, REVIEW, PAYMENT, etc.
    private String relatedEntityId;

    // Actor information (who triggered the notification)
    private String actorPublicId;
    private String actorName;
    private String actorAvatarUrl;

    // Deep linking
    private String actionUrl; // URL to navigate when clicked
    private String actionLabel; // "View Booking", "See Details", etc.

    // Status flags
    @Column(nullable = false)
    @Builder.Default
    private Boolean isRead = false;

    private LocalDateTime readAt;

    @Column(nullable = false)
    @Builder.Default
    private Boolean isArchived = false;

    private LocalDateTime archivedAt;

    // Delivery channels
    @Column(nullable = false)
    @Builder.Default
    private Boolean sentInApp = true;

    @Column(nullable = false)
    @Builder.Default
    private Boolean sentEmail = false;

    private LocalDateTime emailSentAt;

    @Column(nullable = false)
    @Builder.Default
    private Boolean sentPush = false;

    private LocalDateTime pushSentAt;

    // Additional data (JSON format for flexibility)
    @ElementCollection
    @CollectionTable(name = "notification_metadata", joinColumns = @JoinColumn(name = "notification_id"))
    @MapKeyColumn(name = "meta_key")
    @Column(name = "meta_value", length = 1000)
    @Builder.Default
    private Map<String, String> metadata = new HashMap<>();

    // Image/Icon
    private String imageUrl;
    private String iconUrl;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

    // Auto-expire notifications after 90 days
    private LocalDateTime expiresAt;

    @PrePersist
    protected void onCreate() {
        if (publicId == null) {
            publicId = UUID.randomUUID().toString();
        }
        if (expiresAt == null) {
            expiresAt = LocalDateTime.now().plusDays(90);
        }
    }

    /**
     * Notification Types - Airbnb-style categories
     */
    public enum NotificationType {
        // Booking related
        BOOKING_CONFIRMED,
        BOOKING_CANCELLED,
        BOOKING_MODIFIED,
        BOOKING_REMINDER,
        BOOKING_CHECK_IN_REMINDER,
        BOOKING_CHECK_OUT_REMINDER,
        BOOKING_COMPLETED,

        // Host/Landlord related
        NEW_BOOKING_REQUEST,
        BOOKING_INQUIRY,
        INSTANT_BOOKING_RECEIVED,
        GUEST_ARRIVAL_TOMORROW,
        GUEST_CHECKED_IN,
        GUEST_CHECKED_OUT,

        // Payment related
        PAYMENT_RECEIVED,
        PAYMENT_FAILED,
        PAYOUT_PROCESSED,
        REFUND_ISSUED,

        // Review related
        REVIEW_RECEIVED,
        REVIEW_REMINDER,
        REVIEW_RESPONSE,

        // Listing related
        LISTING_APPROVED,
        LISTING_REJECTED,
        LISTING_FEATURED,
        LISTING_EXPIRED,
        LISTING_PRICE_DROP,

        // Messages
        NEW_MESSAGE,
        MESSAGE_INQUIRY,

        // Account related
        ACCOUNT_VERIFIED,
        PROFILE_UPDATE_SUCCESS,
        PASSWORD_CHANGED,
        SECURITY_ALERT,

        // Promotional
        SPECIAL_OFFER,
        DISCOUNT_AVAILABLE,
        WISHLIST_PRICE_DROP,
        NEW_LISTING_IN_AREA,

        // System
        SYSTEM_ANNOUNCEMENT,
        MAINTENANCE_NOTICE,
        POLICY_UPDATE
    }

    /**
     * Notification Categories for filtering
     */
    public enum NotificationCategory {
        BOOKING,
        PAYMENT,
        REVIEW,
        MESSAGE,
        LISTING,
        ACCOUNT,
        PROMOTION,
        SYSTEM
    }

    /**
     * Priority levels
     */
    public enum NotificationPriority {
        LOW,
        NORMAL,
        HIGH,
        URGENT
    }

    // Helper methods
    public void markAsRead() {
        this.isRead = true;
        this.readAt = LocalDateTime.now();
    }

    public void archive() {
        this.isArchived = true;
        this.archivedAt = LocalDateTime.now();
    }

    public void addMetadata(String key, String value) {
        if (this.metadata == null) {
            this.metadata = new HashMap<>();
        }
        this.metadata.put(key, value);
    }

    public boolean isExpired() {
        return expiresAt != null && LocalDateTime.now().isAfter(expiresAt);
    }
}
