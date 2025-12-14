package com.stayease.domain.review.dto;

import com.stayease.domain.review.entity.Review.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

/**
 * DTO for Review responses
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReviewDTO {

    private String publicId;
    private ReviewType reviewType;
    private ReviewStatus status;

    // Related entities
    private String bookingPublicId;
    private String listingPublicId;
    private String servicePublicId;

    // Reviewer info
    private String reviewerPublicId;
    private String reviewerName;
    private String reviewerAvatarUrl;
    private Boolean reviewerIsVerified;

    // Reviewee info (for host/guest reviews)
    private String revieweePublicId;
    private String revieweeName;
    private String revieweeAvatarUrl;

    // Ratings
    private Double overallRating;
    private Double cleanlinessRating;
    private Double accuracyRating;
    private Double checkInRating;
    private Double communicationRating;
    private Double locationRating;
    private Double valueRating;
    private Double respectRating;
    private Double followRulesRating;

    // Content
    private String reviewText;
    private String publicResponse;
    private LocalDateTime respondedAt;

    // Photos
    private List<String> photoUrls;

    // Verification
    private Boolean isVerifiedStay;
    private Boolean isRecommended;

    // Engagement
    private Integer helpfulCount;
    private Integer notHelpfulCount;
    private Integer reportCount;

    // Highlighting
    private Boolean isHighlighted;

    // Language
    private String language;
    private Boolean hasTranslation;
    private Map<String, String> translations;

    // Timestamps
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime publishedAt;

    // Computed fields
    private String timeAgo;
    private Boolean canEdit;
    private Boolean isPubliclyVisible;
}
