package com.stayease.domain.review.dto;

import com.stayease.domain.review.entity.Review.*;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * DTO for creating new reviews
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateReviewDTO {

    @NotNull(message = "Review type is required")
    private ReviewType reviewType;

    @NotBlank(message = "Booking ID is required")
    private String bookingPublicId;

    private String listingPublicId; // Required for PROPERTY_REVIEW

    private String servicePublicId; // Required for SERVICE_REVIEW

    @NotBlank(message = "Reviewer ID is required")
    private String reviewerPublicId;

    private String revieweePublicId; // Required for HOST_REVIEW and GUEST_REVIEW

    // Ratings (1-5 stars, decimal allowed for precision)
    @NotNull(message = "Overall rating is required")
    @DecimalMin(value = "1.0", message = "Rating must be at least 1.0")
    @DecimalMax(value = "5.0", message = "Rating must not exceed 5.0")
    private Double overallRating;

    // Detailed category ratings (optional, but recommended)
    @DecimalMin(value = "1.0", message = "Cleanliness rating must be at least 1.0")
    @DecimalMax(value = "5.0", message = "Cleanliness rating must not exceed 5.0")
    private Double cleanlinessRating;

    @DecimalMin(value = "1.0", message = "Accuracy rating must be at least 1.0")
    @DecimalMax(value = "5.0", message = "Accuracy rating must not exceed 5.0")
    private Double accuracyRating;

    @DecimalMin(value = "1.0", message = "Check-in rating must be at least 1.0")
    @DecimalMax(value = "5.0", message = "Check-in rating must not exceed 5.0")
    private Double checkInRating;

    @DecimalMin(value = "1.0", message = "Communication rating must be at least 1.0")
    @DecimalMax(value = "5.0", message = "Communication rating must not exceed 5.0")
    private Double communicationRating;

    @DecimalMin(value = "1.0", message = "Location rating must be at least 1.0")
    @DecimalMax(value = "5.0", message = "Location rating must not exceed 5.0")
    private Double locationRating;

    @DecimalMin(value = "1.0", message = "Value rating must be at least 1.0")
    @DecimalMax(value = "5.0", message = "Value rating must not exceed 5.0")
    private Double valueRating;

    // For guest reviews
    @DecimalMin(value = "1.0", message = "Respect rating must be at least 1.0")
    @DecimalMax(value = "5.0", message = "Respect rating must not exceed 5.0")
    private Double respectRating;

    @DecimalMin(value = "1.0", message = "Follow rules rating must be at least 1.0")
    @DecimalMax(value = "5.0", message = "Follow rules rating must not exceed 5.0")
    private Double followRulesRating;

    // Review content
    @NotBlank(message = "Review text is required")
    @Size(min = 50, max = 5000, message = "Review text must be between 50 and 5000 characters")
    private String reviewText;

    @Size(max = 1000, message = "Private note must not exceed 1000 characters")
    private String privateNote;

    // Recommendation
    @NotNull(message = "Recommendation is required")
    @Builder.Default
    private Boolean isRecommended = true;

    // Photos (URLs of uploaded photos)
    @Size(max = 10, message = "Maximum 10 photos allowed")
    private List<String> photoUrls;

    // Language
    private String language;
}
