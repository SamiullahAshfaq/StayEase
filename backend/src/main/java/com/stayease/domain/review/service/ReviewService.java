package com.stayease.domain.review.service;

import com.stayease.domain.review.dto.*;
import com.stayease.domain.review.entity.Review;
import com.stayease.domain.review.entity.Review.*;
import com.stayease.domain.review.repository.ReviewRepository;
import com.stayease.exception.BadRequestException;
import com.stayease.exception.ForbiddenException;
import com.stayease.exception.NotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.scheduling.annotation.Scheduled;
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
public class ReviewService {

    private final ReviewRepository reviewRepository;
    // TODO: Inject NotificationService, UserService, ListingService when available

    private static final int AUTO_PUBLISH_DAYS = 14; // Airbnb-style: reviews auto-publish after 14 days

    /**
     * Create a new review
     */
    public ReviewDTO createReview(CreateReviewDTO dto) {
        log.info("Creating review for booking: {}, reviewer: {}", dto.getBookingPublicId(), dto.getReviewerPublicId());

        // Check if user has already reviewed this booking
        boolean alreadyReviewed = reviewRepository.hasReviewedBooking(
                dto.getBookingPublicId(),
                dto.getReviewerPublicId(),
                dto.getReviewType());

        if (alreadyReviewed) {
            throw new BadRequestException("You have already submitted a review for this booking");
        }

        // Validate required fields based on review type
        validateReviewType(dto);

        Review review = Review.builder()
                .publicId(UUID.randomUUID().toString())
                .reviewType(dto.getReviewType())
                .status(ReviewStatus.PENDING)
                .bookingPublicId(dto.getBookingPublicId())
                .listingPublicId(dto.getListingPublicId())
                .servicePublicId(dto.getServicePublicId())
                .reviewerPublicId(dto.getReviewerPublicId())
                .revieweePublicId(dto.getRevieweePublicId())
                .overallRating(dto.getOverallRating())
                .cleanlinessRating(dto.getCleanlinessRating())
                .accuracyRating(dto.getAccuracyRating())
                .checkInRating(dto.getCheckInRating())
                .communicationRating(dto.getCommunicationRating())
                .locationRating(dto.getLocationRating())
                .valueRating(dto.getValueRating())
                .respectRating(dto.getRespectRating())
                .followRulesRating(dto.getFollowRulesRating())
                .reviewText(dto.getReviewText())
                .privateNote(dto.getPrivateNote())
                .isRecommended(dto.getIsRecommended())
                .isVerifiedStay(true) // Assuming all reviews from bookings are verified
                .language(dto.getLanguage() != null ? dto.getLanguage() : "en")
                .scheduledPublishAt(LocalDateTime.now().plusDays(AUTO_PUBLISH_DAYS))
                .build();

        // Add photos if provided
        if (dto.getPhotoUrls() != null && !dto.getPhotoUrls().isEmpty()) {
            dto.getPhotoUrls().forEach(review::addPhoto);
        }

        // Calculate overall rating from categories if not provided
        if (dto.getOverallRating() == null) {
            review.calculateOverallRating();
        }

        review = reviewRepository.save(review);

        // TODO: Send notification to reviewee
        // notificationService.notifyNewReview(review);

        log.info("Review created with ID: {}, scheduled to publish at: {}",
                review.getPublicId(), review.getScheduledPublishAt());

        return mapToDTO(review);
    }

    /**
     * Get review by public ID
     */
    @Transactional(readOnly = true)
    public ReviewDTO getReview(String publicId) {
        Review review = reviewRepository.findByPublicId(publicId)
                .orElseThrow(() -> new NotFoundException("Review not found with ID: " + publicId));
        return mapToDTO(review);
    }

    /**
     * Get reviews for a listing
     */
    @Transactional(readOnly = true)
    public Page<ReviewDTO> getListingReviews(String listingPublicId, Pageable pageable) {
        Page<Review> reviews = reviewRepository.findByListingPublicIdAndStatusOrderByCreatedAtDesc(
                listingPublicId, ReviewStatus.PUBLISHED, pageable);
        return reviews.map(this::mapToDTO);
    }

    /**
     * Get highlighted reviews for a listing
     */
    @Transactional(readOnly = true)
    public List<ReviewDTO> getHighlightedReviews(String listingPublicId) {
        List<Review> reviews = reviewRepository.findHighlightedReviewsForListing(listingPublicId);
        return reviews.stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Get reviews written by a user
     */
    @Transactional(readOnly = true)
    public Page<ReviewDTO> getUserReviews(String userPublicId, Pageable pageable) {
        Page<Review> reviews = reviewRepository.findByReviewerPublicIdOrderByCreatedAtDesc(userPublicId, pageable);
        return reviews.map(this::mapToDTO);
    }

    /**
     * Get reviews about a host
     */
    @Transactional(readOnly = true)
    public Page<ReviewDTO> getHostReviews(String hostPublicId, Pageable pageable) {
        Page<Review> reviews = reviewRepository.findHostReviews(hostPublicId, pageable);
        return reviews.map(this::mapToDTO);
    }

    /**
     * Get reviews about a guest
     */
    @Transactional(readOnly = true)
    public Page<ReviewDTO> getGuestReviews(String guestPublicId, Pageable pageable) {
        Page<Review> reviews = reviewRepository.findGuestReviews(guestPublicId, pageable);
        return reviews.map(this::mapToDTO);
    }

    /**
     * Get review statistics for a listing
     */
    @Transactional(readOnly = true)
    public ReviewStatisticsDTO getListingStatistics(String listingPublicId) {
        long totalReviews = reviewRepository.countPublishedReviewsForListing(listingPublicId);

        if (totalReviews == 0) {
            return ReviewStatisticsDTO.builder()
                    .totalReviews(0L)
                    .averageRating(0.0)
                    .build();
        }

        Double avgRating = reviewRepository.getAverageRatingForListing(listingPublicId);
        Double avgCleanliness = reviewRepository.getAverageCleanlinessForListing(listingPublicId);
        Double avgAccuracy = reviewRepository.getAverageAccuracyForListing(listingPublicId);
        Double avgCheckIn = reviewRepository.getAverageCheckInForListing(listingPublicId);
        Double avgCommunication = reviewRepository.getAverageCommunicationForListing(listingPublicId);
        Double avgLocation = reviewRepository.getAverageLocationForListing(listingPublicId);
        Double avgValue = reviewRepository.getAverageValueForListing(listingPublicId);

        // Rating distribution
        long fiveStarCount = reviewRepository.countFiveStarReviewsForListing(listingPublicId);
        long fourStarCount = reviewRepository.countFourStarReviewsForListing(listingPublicId);
        long threeStarCount = reviewRepository.countThreeStarReviewsForListing(listingPublicId);
        long twoStarCount = reviewRepository.countTwoStarReviewsForListing(listingPublicId);
        long oneStarCount = reviewRepository.countOneStarReviewsForListing(listingPublicId);

        // Recommendation
        long recommendCount = reviewRepository.countRecommendedForListing(listingPublicId);

        // Recent activity
        LocalDateTime oneMonthAgo = LocalDateTime.now().minusMonths(1);
        LocalDateTime oneYearAgo = LocalDateTime.now().minusYears(1);
        long reviewsLastMonth = reviewRepository.countRecentReviewsForListing(listingPublicId, oneMonthAgo);
        long reviewsLastYear = reviewRepository.countRecentReviewsForListing(listingPublicId, oneYearAgo);

        return ReviewStatisticsDTO.builder()
                .totalReviews(totalReviews)
                .averageRating(roundToOneDecimal(avgRating))
                .averageCleanliness(roundToOneDecimal(avgCleanliness))
                .averageAccuracy(roundToOneDecimal(avgAccuracy))
                .averageCheckIn(roundToOneDecimal(avgCheckIn))
                .averageCommunication(roundToOneDecimal(avgCommunication))
                .averageLocation(roundToOneDecimal(avgLocation))
                .averageValue(roundToOneDecimal(avgValue))
                .fiveStarCount(fiveStarCount)
                .fourStarCount(fourStarCount)
                .threeStarCount(threeStarCount)
                .twoStarCount(twoStarCount)
                .oneStarCount(oneStarCount)
                .fiveStarPercentage(calculatePercentage(fiveStarCount, totalReviews))
                .fourStarPercentage(calculatePercentage(fourStarCount, totalReviews))
                .threeStarPercentage(calculatePercentage(threeStarCount, totalReviews))
                .twoStarPercentage(calculatePercentage(twoStarCount, totalReviews))
                .oneStarPercentage(calculatePercentage(oneStarCount, totalReviews))
                .recommendCount(recommendCount)
                .recommendPercentage(calculatePercentage(recommendCount, totalReviews))
                .reviewsLastMonth(reviewsLastMonth)
                .reviewsLastYear(reviewsLastYear)
                .build();
    }

    /**
     * Update a review (only if pending or flagged)
     */
    public ReviewDTO updateReview(String publicId, UpdateReviewDTO dto, String userPublicId) {
        Review review = reviewRepository.findByPublicId(publicId)
                .orElseThrow(() -> new NotFoundException("Review not found with ID: " + publicId));

        // Check permissions
        if (!review.getReviewerPublicId().equals(userPublicId)) {
            throw new ForbiddenException("You can only edit your own reviews");
        }

        if (!review.canEdit()) {
            throw new BadRequestException("This review cannot be edited anymore");
        }

        // Update ratings
        if (dto.getOverallRating() != null)
            review.setOverallRating(dto.getOverallRating());
        if (dto.getCleanlinessRating() != null)
            review.setCleanlinessRating(dto.getCleanlinessRating());
        if (dto.getAccuracyRating() != null)
            review.setAccuracyRating(dto.getAccuracyRating());
        if (dto.getCheckInRating() != null)
            review.setCheckInRating(dto.getCheckInRating());
        if (dto.getCommunicationRating() != null)
            review.setCommunicationRating(dto.getCommunicationRating());
        if (dto.getLocationRating() != null)
            review.setLocationRating(dto.getLocationRating());
        if (dto.getValueRating() != null)
            review.setValueRating(dto.getValueRating());
        if (dto.getRespectRating() != null)
            review.setRespectRating(dto.getRespectRating());
        if (dto.getFollowRulesRating() != null)
            review.setFollowRulesRating(dto.getFollowRulesRating());

        // Update content
        if (dto.getReviewText() != null)
            review.setReviewText(dto.getReviewText());
        if (dto.getPrivateNote() != null)
            review.setPrivateNote(dto.getPrivateNote());
        if (dto.getIsRecommended() != null)
            review.setIsRecommended(dto.getIsRecommended());

        // Update photos
        if (dto.getPhotoUrls() != null) {
            review.setPhotoUrls(dto.getPhotoUrls());
        }

        // Recalculate overall rating
        review.calculateOverallRating();

        review = reviewRepository.save(review);
        log.info("Review {} updated by user {}", publicId, userPublicId);

        return mapToDTO(review);
    }

    /**
     * Add response to a review
     */
    public ReviewDTO addResponse(String publicId, ReviewResponseDTO dto, String userPublicId) {
        Review review = reviewRepository.findByPublicId(publicId)
                .orElseThrow(() -> new NotFoundException("Review not found with ID: " + publicId));

        // Check permissions - only reviewee can respond
        if (!review.getRevieweePublicId().equals(userPublicId)) {
            throw new ForbiddenException("You can only respond to reviews about you");
        }

        if (review.getPublicResponse() != null) {
            throw new BadRequestException("A response has already been posted for this review");
        }

        review.addResponse(dto.getPublicResponse());
        review = reviewRepository.save(review);

        // TODO: Notify reviewer about the response
        // notificationService.notifyReviewResponse(review);

        log.info("Response added to review {} by user {}", publicId, userPublicId);
        return mapToDTO(review);
    }

    /**
     * Publish a review immediately
     */
    public ReviewDTO publishReview(String publicId, String userPublicId) {
        Review review = reviewRepository.findByPublicId(publicId)
                .orElseThrow(() -> new NotFoundException("Review not found with ID: " + publicId));

        if (!review.getReviewerPublicId().equals(userPublicId)) {
            throw new ForbiddenException("You can only publish your own reviews");
        }

        if (review.getStatus() != ReviewStatus.PENDING) {
            throw new BadRequestException("Only pending reviews can be published");
        }

        review.publish();
        review = reviewRepository.save(review);

        // TODO: Notify reviewee and update listing rating
        // notificationService.notifyReviewPublished(review);
        // listingService.updateRating(review.getListingPublicId());

        log.info("Review {} published by user {}", publicId, userPublicId);
        return mapToDTO(review);
    }

    /**
     * Mark review as helpful
     */
    public void markHelpful(String publicId) {
        reviewRepository.incrementHelpfulCount(publicId);
        log.info("Review {} marked as helpful", publicId);
    }

    /**
     * Mark review as not helpful
     */
    public void markNotHelpful(String publicId) {
        reviewRepository.incrementNotHelpfulCount(publicId);
        log.info("Review {} marked as not helpful", publicId);
    }

    /**
     * Report a review
     */
    public void reportReview(String publicId, String reason) {
        Review review = reviewRepository.findByPublicId(publicId)
                .orElseThrow(() -> new NotFoundException("Review not found with ID: " + publicId));

        review.report();

        // Auto-flag if report count exceeds threshold
        if (review.getReportCount() >= 5) {
            review.flag("Auto-flagged: Multiple reports", "SYSTEM");
        }

        reviewRepository.save(review);
        log.info("Review {} reported. Total reports: {}", publicId, review.getReportCount());
    }

    /**
     * Moderate review (admin only)
     */
    public ReviewDTO moderateReview(String publicId, ModerateReviewDTO dto) {
        Review review = reviewRepository.findByPublicId(publicId)
                .orElseThrow(() -> new NotFoundException("Review not found with ID: " + publicId));

        review.setStatus(dto.getStatus());
        review.setModerationNotes(dto.getModerationNotes());
        review.setModeratedBy(dto.getModeratedBy());
        review.setModeratedAt(LocalDateTime.now());

        if (dto.getStatus() == ReviewStatus.APPROVED) {
            review.publish();
        }

        review = reviewRepository.save(review);
        log.info("Review {} moderated by {} with status {}", publicId, dto.getModeratedBy(), dto.getStatus());

        return mapToDTO(review);
    }

    /**
     * Highlight/unhighlight a review (admin/host only)
     */
    public ReviewDTO toggleHighlight(String publicId, boolean highlight) {
        Review review = reviewRepository.findByPublicId(publicId)
                .orElseThrow(() -> new NotFoundException("Review not found with ID: " + publicId));

        review.setIsHighlighted(highlight);
        review = reviewRepository.save(review);

        log.info("Review {} {} highlighted", publicId, highlight ? "is now" : "is no longer");
        return mapToDTO(review);
    }

    /**
     * Delete a review
     */
    public void deleteReview(String publicId, String userPublicId) {
        Review review = reviewRepository.findByPublicId(publicId)
                .orElseThrow(() -> new NotFoundException("Review not found with ID: " + publicId));

        if (!review.getReviewerPublicId().equals(userPublicId)) {
            throw new ForbiddenException("You can only delete your own reviews");
        }

        review.softDelete();
        reviewRepository.save(review);

        log.info("Review {} soft deleted by user {}", publicId, userPublicId);
    }

    /**
     * Get flagged reviews (admin only)
     */
    @Transactional(readOnly = true)
    public Page<ReviewDTO> getFlaggedReviews(Pageable pageable) {
        Page<Review> reviews = reviewRepository.findFlaggedReviews(3, pageable);
        return reviews.map(this::mapToDTO);
    }

    /**
     * Auto-publish pending reviews (scheduled task - runs daily)
     */
    @Scheduled(cron = "0 0 2 * * *") // Run at 2 AM daily
    public void autoPublishPendingReviews() {
        List<Review> pendingReviews = reviewRepository.findReviewsPendingAutoPublish(LocalDateTime.now());

        for (Review review : pendingReviews) {
            review.publish();
            review.setIsAutoPublished(true);
            reviewRepository.save(review);

            // TODO: Notify and update ratings
            log.info("Auto-published review {}", review.getPublicId());
        }

        log.info("Auto-published {} pending reviews", pendingReviews.size());
    }

    /**
     * Validate review type requirements
     */
    private void validateReviewType(CreateReviewDTO dto) {
        switch (dto.getReviewType()) {
            case PROPERTY_REVIEW:
                if (dto.getListingPublicId() == null) {
                    throw new BadRequestException("Listing ID is required for property reviews");
                }
                break;
            case HOST_REVIEW:
            case GUEST_REVIEW:
                if (dto.getRevieweePublicId() == null) {
                    throw new BadRequestException("Reviewee ID is required for host/guest reviews");
                }
                break;
            case SERVICE_REVIEW:
                if (dto.getServicePublicId() == null) {
                    throw new BadRequestException("Service ID is required for service reviews");
                }
                break;
            case EXPERIENCE_REVIEW:
                // EXPERIENCE_REVIEW can be added when experience feature is implemented
                break;
        }
    }

    /**
     * Map entity to DTO
     */
    private ReviewDTO mapToDTO(Review review) {
        String timeAgo = calculateTimeAgo(review.getCreatedAt());

        return ReviewDTO.builder()
                .publicId(review.getPublicId())
                .reviewType(review.getReviewType())
                .status(review.getStatus())
                .bookingPublicId(review.getBookingPublicId())
                .listingPublicId(review.getListingPublicId())
                .servicePublicId(review.getServicePublicId())
                .reviewerPublicId(review.getReviewerPublicId())
                // TODO: Fetch reviewer details from UserService
                .reviewerName("User Name") // Placeholder
                .reviewerAvatarUrl(null)
                .reviewerIsVerified(true)
                .revieweePublicId(review.getRevieweePublicId())
                // TODO: Fetch reviewee details
                .revieweeName("Reviewee Name") // Placeholder
                .revieweeAvatarUrl(null)
                .overallRating(review.getOverallRating())
                .cleanlinessRating(review.getCleanlinessRating())
                .accuracyRating(review.getAccuracyRating())
                .checkInRating(review.getCheckInRating())
                .communicationRating(review.getCommunicationRating())
                .locationRating(review.getLocationRating())
                .valueRating(review.getValueRating())
                .respectRating(review.getRespectRating())
                .followRulesRating(review.getFollowRulesRating())
                .reviewText(review.getReviewText())
                .publicResponse(review.getPublicResponse())
                .respondedAt(review.getRespondedAt())
                .photoUrls(review.getPhotoUrls())
                .isVerifiedStay(review.getIsVerifiedStay())
                .isRecommended(review.getIsRecommended())
                .helpfulCount(review.getHelpfulCount())
                .notHelpfulCount(review.getNotHelpfulCount())
                .reportCount(review.getReportCount())
                .isHighlighted(review.getIsHighlighted())
                .language(review.getLanguage())
                .hasTranslation(review.getHasTranslation())
                .translations(review.getTranslations())
                .createdAt(review.getCreatedAt())
                .updatedAt(review.getUpdatedAt())
                .publishedAt(review.getPublishedAt())
                .timeAgo(timeAgo)
                .canEdit(review.canEdit())
                .isPubliclyVisible(review.isPubliclyVisible())
                .build();
    }

    /**
     * Calculate human-readable time ago
     */
    private String calculateTimeAgo(LocalDateTime createdAt) {
        if (createdAt == null)
            return "Unknown";

        LocalDateTime now = LocalDateTime.now();
        long days = ChronoUnit.DAYS.between(createdAt, now);

        if (days == 0)
            return "Today";
        if (days == 1)
            return "Yesterday";
        if (days < 7)
            return days + " days ago";
        if (days < 30)
            return (days / 7) + " weeks ago";
        if (days < 365)
            return (days / 30) + " months ago";
        return (days / 365) + " years ago";
    }

    private Double roundToOneDecimal(Double value) {
        if (value == null)
            return 0.0;
        return Math.round(value * 10.0) / 10.0;
    }

    private Double calculatePercentage(long count, long total) {
        if (total == 0)
            return 0.0;
        return roundToOneDecimal((count * 100.0) / total);
    }
}
