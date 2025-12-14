package com.stayease.domain.review.dto;

import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * DTO for updating existing reviews
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateReviewDTO {

    // Ratings
    @DecimalMin(value = "1.0", message = "Overall rating must be at least 1.0")
    @DecimalMax(value = "5.0", message = "Overall rating must not exceed 5.0")
    private Double overallRating;

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

    @DecimalMin(value = "1.0", message = "Respect rating must be at least 1.0")
    @DecimalMax(value = "5.0", message = "Respect rating must not exceed 5.0")
    private Double respectRating;

    @DecimalMin(value = "1.0", message = "Follow rules rating must be at least 1.0")
    @DecimalMax(value = "5.0", message = "Follow rules rating must not exceed 5.0")
    private Double followRulesRating;

    // Review content
    @Size(min = 50, max = 5000, message = "Review text must be between 50 and 5000 characters")
    private String reviewText;

    @Size(max = 1000, message = "Private note must not exceed 1000 characters")
    private String privateNote;

    // Recommendation
    private Boolean isRecommended;

    // Photos
    @Size(max = 10, message = "Maximum 10 photos allowed")
    private List<String> photoUrls;
}
