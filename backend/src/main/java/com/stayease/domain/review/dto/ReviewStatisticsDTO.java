package com.stayease.domain.review.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO for review statistics (Airbnb-style)
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReviewStatisticsDTO {

    // Overall statistics
    private Long totalReviews;
    private Double averageRating;

    // Category averages
    private Double averageCleanliness;
    private Double averageAccuracy;
    private Double averageCheckIn;
    private Double averageCommunication;
    private Double averageLocation;
    private Double averageValue;

    // Distribution (how many reviews per star rating)
    private Long fiveStarCount;
    private Long fourStarCount;
    private Long threeStarCount;
    private Long twoStarCount;
    private Long oneStarCount;

    // Percentages
    private Double fiveStarPercentage;
    private Double fourStarPercentage;
    private Double threeStarPercentage;
    private Double twoStarPercentage;
    private Double oneStarPercentage;

    // Recommendation
    private Long recommendCount;
    private Double recommendPercentage;

    // Recent activity
    private Long reviewsLastMonth;
    private Long reviewsLastYear;
}
