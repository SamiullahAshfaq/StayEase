package com.stayease.domain.review.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Review entity - Supports property reviews, host reviews, and guest reviews
 * (Airbnb-style)
 */
@Entity
@Table(name = "reviews", indexes = {
        @Index(name = "idx_review_public_id", columnList = "publicId"),
        @Index(name = "idx_review_listing", columnList = "listingPublicId"),
        @Index(name = "idx_review_booking", columnList = "bookingPublicId"),
        @Index(name = "idx_review_reviewer", columnList = "reviewerPublicId"),
        @Index(name = "idx_review_reviewee", columnList = "revieweePublicId"),
        @Index(name = "idx_review_type", columnList = "reviewType"),
        @Index(name = "idx_review_status", columnList = "status"),
        @Index(name = "idx_review_rating", columnList = "overallRating"),
        @Index(name = "idx_review_created", columnList = "createdAt"),
        @Index(name = "idx_review_listing_status", columnList = "listingPublicId, status")
})
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(of = "id")
public class Review {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "review_seq")
    @SequenceGenerator(name = "review_seq", sequenceName = "review_sequence", allocationSize = 1)
    private Long id;

    @Column(nullable = false, unique = true, updatable = false)
    private String publicId;

    /**
     * Review Type
     */
    public enum ReviewType {
        PROPERTY_REVIEW, // Guest reviews the property/listing
        HOST_REVIEW, // Guest reviews the host
        GUEST_REVIEW, // Host reviews the guest
        SERVICE_REVIEW, // Review for additional services
        EXPERIENCE_REVIEW // Review for experiences/activities
    }

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ReviewType reviewType;

    /**
     * Review Status
     */
    public enum ReviewStatus {
        PENDING, // Review submitted but not yet published
        PUBLISHED, // Review is live and visible
        FLAGGED, // Flagged for review by moderators
        UNDER_REVIEW, // Being reviewed by moderators
        APPROVED, // Approved by moderators
        REJECTED, // Rejected by moderators
        HIDDEN, // Hidden by admin or host
        DELETED // Soft deleted
    }

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private ReviewStatus status = ReviewStatus.PENDING;

    // Related entities
    @Column(nullable = false)
    private String bookingPublicId; // The booking this review is for

    private String listingPublicId; // The listing being reviewed (for property reviews)

    private String servicePublicId; // The service being reviewed (for service reviews)

    // Reviewer and Reviewee
    @Column(nullable = false)
    private String reviewerPublicId; // Person writing the review

    private String revieweePublicId; // Person/entity being reviewed (host or guest)

    /**
     * Ratings (1-5 stars, Airbnb uses decimal ratings)
     */
    @Column(nullable = false)
    private Double overallRating; // Overall rating (average of all category ratings)

    // Detailed category ratings (Airbnb-style)
    private Double cleanlinessRating; // How clean was the property
    private Double accuracyRating; // How accurate was the listing description
    private Double checkInRating; // Check-in experience
    private Double communicationRating; // Host communication
    private Double locationRating; // Location rating
    private Double valueRating; // Value for money

    // Additional ratings for guest reviews
    private Double respectRating; // Guest's respect for property
    private Double followRulesRating; // Following house rules

    /**
     * Review Content
     */
    @Column(columnDefinition = "TEXT")
    private String reviewText; // Main review text

    @Column(columnDefinition = "TEXT")
    private String privateNote; // Private feedback (not shown publicly)

    @Column(columnDefinition = "TEXT")
    private String publicResponse; // Host/Guest response to review

    private LocalDateTime respondedAt; // When the response was posted

    /**
     * Review Photos
     */
    @ElementCollection
    @CollectionTable(name = "review_photos", joinColumns = @JoinColumn(name = "review_id"))
    @Column(name = "photo_url")
    @Builder.Default
    private List<String> photoUrls = new ArrayList<>();

    /**
     * Verification & Trust
     */
    private Boolean isVerifiedStay; // Review from a verified/completed booking

    @Column(nullable = false)
    @Builder.Default
    private Boolean isRecommended = false; // Would recommend to others (Yes/No)

    /**
     * Moderation & Flagging
     */
    private String flagReason; // Reason for flagging
    private LocalDateTime flaggedAt;
    private String flaggedBy; // Admin who flagged it

    private String moderationNotes; // Internal moderation notes
    private String moderatedBy; // Admin who moderated
    private LocalDateTime moderatedAt;

    /**
     * Helpfulness (like Airbnb's "Was this helpful?")
     */
    @Column(nullable = false)
    @Builder.Default
    private Integer helpfulCount = 0;

    @Column(nullable = false)
    @Builder.Default
    private Integer notHelpfulCount = 0;

    @Column(nullable = false)
    @Builder.Default
    private Integer reportCount = 0; // Number of times reported

    /**
     * Auto-posting (Airbnb publishes reviews automatically after 14 days)
     */
    private LocalDateTime scheduledPublishAt; // When to auto-publish

    @Column(nullable = false)
    @Builder.Default
    private Boolean isAutoPublished = false;

    /**
     * Host Highlight Badge (Airbnb shows standout reviews)
     */
    @Column(nullable = false)
    @Builder.Default
    private Boolean isHighlighted = false;

    /**
     * Language & Translation
     */
    private String language; // Original language
    private Boolean hasTranslation;

    @ElementCollection
    @CollectionTable(name = "review_translations", joinColumns = @JoinColumn(name = "review_id"))
    @MapKeyColumn(name = "language_code")
    @Column(name = "translated_text", columnDefinition = "TEXT")
    private java.util.Map<String, String> translations;

    /**
     * Timestamps
     */
    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(nullable = false)
    private LocalDateTime updatedAt;

    private LocalDateTime publishedAt; // When review was published

    private LocalDateTime deletedAt; // Soft delete timestamp

    /**
     * Helper methods
     */

    /**
     * Calculate overall rating from category ratings
     */
    public void calculateOverallRating() {
        List<Double> ratings = new ArrayList<>();

        if (cleanlinessRating != null)
            ratings.add(cleanlinessRating);
        if (accuracyRating != null)
            ratings.add(accuracyRating);
        if (checkInRating != null)
            ratings.add(checkInRating);
        if (communicationRating != null)
            ratings.add(communicationRating);
        if (locationRating != null)
            ratings.add(locationRating);
        if (valueRating != null)
            ratings.add(valueRating);
        if (respectRating != null)
            ratings.add(respectRating);
        if (followRulesRating != null)
            ratings.add(followRulesRating);

        if (!ratings.isEmpty()) {
            this.overallRating = ratings.stream()
                    .mapToDouble(Double::doubleValue)
                    .average()
                    .orElse(0.0);
            // Round to 1 decimal place
            this.overallRating = Math.round(this.overallRating * 10.0) / 10.0;
        }
    }

    /**
     * Publish the review
     */
    public void publish() {
        this.status = ReviewStatus.PUBLISHED;
        this.publishedAt = LocalDateTime.now();
    }

    /**
     * Flag the review
     */
    public void flag(String reason, String flaggedBy) {
        this.status = ReviewStatus.FLAGGED;
        this.flagReason = reason;
        this.flaggedBy = flaggedBy;
        this.flaggedAt = LocalDateTime.now();
    }

    /**
     * Mark as helpful
     */
    public void markHelpful() {
        this.helpfulCount++;
    }

    /**
     * Mark as not helpful
     */
    public void markNotHelpful() {
        this.notHelpfulCount++;
    }

    /**
     * Report review
     */
    public void report() {
        this.reportCount++;
    }

    /**
     * Add photo
     */
    public void addPhoto(String photoUrl) {
        if (this.photoUrls == null) {
            this.photoUrls = new ArrayList<>();
        }
        this.photoUrls.add(photoUrl);
    }

    /**
     * Add response
     */
    public void addResponse(String response) {
        this.publicResponse = response;
        this.respondedAt = LocalDateTime.now();
    }

    /**
     * Check if review can be edited
     */
    public boolean canEdit() {
        return this.status == ReviewStatus.PENDING ||
                this.status == ReviewStatus.FLAGGED;
    }

    /**
     * Check if review is visible to public
     */
    public boolean isPubliclyVisible() {
        return this.status == ReviewStatus.PUBLISHED ||
                this.status == ReviewStatus.APPROVED;
    }

    /**
     * Soft delete
     */
    public void softDelete() {
        this.status = ReviewStatus.DELETED;
        this.deletedAt = LocalDateTime.now();
    }
}
