package com.stayease.domain.review.repository;

import com.stayease.domain.review.entity.Review;
import com.stayease.domain.review.entity.Review.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Long> {

    // Find by public ID
    Optional<Review> findByPublicId(String publicId);

    // Find by booking
    List<Review> findByBookingPublicId(String bookingPublicId);

    Optional<Review> findByBookingPublicIdAndReviewerPublicId(String bookingPublicId, String reviewerPublicId);

    // Find by listing
    Page<Review> findByListingPublicIdAndStatusOrderByCreatedAtDesc(
            String listingPublicId,
            ReviewStatus status,
            Pageable pageable);

    List<Review> findByListingPublicIdAndStatus(String listingPublicId, ReviewStatus status);

    // Find by reviewer
    Page<Review> findByReviewerPublicIdOrderByCreatedAtDesc(String reviewerPublicId, Pageable pageable);

    // Find by reviewee (for hosts and guests)
    Page<Review> findByRevieweePublicIdAndStatusOrderByCreatedAtDesc(
            String revieweePublicId,
            ReviewStatus status,
            Pageable pageable);

    // Find by type
    Page<Review> findByReviewTypeAndStatusOrderByCreatedAtDesc(
            ReviewType reviewType,
            ReviewStatus status,
            Pageable pageable);

    // Find by status
    Page<Review> findByStatusOrderByCreatedAtDesc(ReviewStatus status, Pageable pageable);

    // Find highlighted reviews for a listing
    @Query("SELECT r FROM Review r WHERE r.listingPublicId = :listingPublicId " +
            "AND r.isHighlighted = true AND r.status = 'PUBLISHED' " +
            "ORDER BY r.createdAt DESC")
    List<Review> findHighlightedReviewsForListing(@Param("listingPublicId") String listingPublicId);

    // Find reviews pending auto-publish
    @Query("SELECT r FROM Review r WHERE r.status = 'PENDING' " +
            "AND r.scheduledPublishAt <= :now")
    List<Review> findReviewsPendingAutoPublish(@Param("now") LocalDateTime now);

    // Check if user can review booking
    @Query("SELECT CASE WHEN COUNT(r) > 0 THEN true ELSE false END FROM Review r " +
            "WHERE r.bookingPublicId = :bookingPublicId " +
            "AND r.reviewerPublicId = :reviewerPublicId " +
            "AND r.reviewType = :reviewType")
    boolean hasReviewedBooking(
            @Param("bookingPublicId") String bookingPublicId,
            @Param("reviewerPublicId") String reviewerPublicId,
            @Param("reviewType") ReviewType reviewType);

    // Statistics queries
    @Query("SELECT COUNT(r) FROM Review r WHERE r.listingPublicId = :listingPublicId " +
            "AND r.status = 'PUBLISHED'")
    long countPublishedReviewsForListing(@Param("listingPublicId") String listingPublicId);

    @Query("SELECT AVG(r.overallRating) FROM Review r WHERE r.listingPublicId = :listingPublicId " +
            "AND r.status = 'PUBLISHED'")
    Double getAverageRatingForListing(@Param("listingPublicId") String listingPublicId);

    @Query("SELECT AVG(r.cleanlinessRating) FROM Review r WHERE r.listingPublicId = :listingPublicId " +
            "AND r.status = 'PUBLISHED' AND r.cleanlinessRating IS NOT NULL")
    Double getAverageCleanlinessForListing(@Param("listingPublicId") String listingPublicId);

    @Query("SELECT AVG(r.accuracyRating) FROM Review r WHERE r.listingPublicId = :listingPublicId " +
            "AND r.status = 'PUBLISHED' AND r.accuracyRating IS NOT NULL")
    Double getAverageAccuracyForListing(@Param("listingPublicId") String listingPublicId);

    @Query("SELECT AVG(r.checkInRating) FROM Review r WHERE r.listingPublicId = :listingPublicId " +
            "AND r.status = 'PUBLISHED' AND r.checkInRating IS NOT NULL")
    Double getAverageCheckInForListing(@Param("listingPublicId") String listingPublicId);

    @Query("SELECT AVG(r.communicationRating) FROM Review r WHERE r.listingPublicId = :listingPublicId " +
            "AND r.status = 'PUBLISHED' AND r.communicationRating IS NOT NULL")
    Double getAverageCommunicationForListing(@Param("listingPublicId") String listingPublicId);

    @Query("SELECT AVG(r.locationRating) FROM Review r WHERE r.listingPublicId = :listingPublicId " +
            "AND r.status = 'PUBLISHED' AND r.locationRating IS NOT NULL")
    Double getAverageLocationForListing(@Param("listingPublicId") String listingPublicId);

    @Query("SELECT AVG(r.valueRating) FROM Review r WHERE r.listingPublicId = :listingPublicId " +
            "AND r.status = 'PUBLISHED' AND r.valueRating IS NOT NULL")
    Double getAverageValueForListing(@Param("listingPublicId") String listingPublicId);

    // Rating distribution
    @Query("SELECT COUNT(r) FROM Review r WHERE r.listingPublicId = :listingPublicId " +
            "AND r.status = 'PUBLISHED' AND r.overallRating >= 4.5")
    long countFiveStarReviewsForListing(@Param("listingPublicId") String listingPublicId);

    @Query("SELECT COUNT(r) FROM Review r WHERE r.listingPublicId = :listingPublicId " +
            "AND r.status = 'PUBLISHED' AND r.overallRating >= 3.5 AND r.overallRating < 4.5")
    long countFourStarReviewsForListing(@Param("listingPublicId") String listingPublicId);

    @Query("SELECT COUNT(r) FROM Review r WHERE r.listingPublicId = :listingPublicId " +
            "AND r.status = 'PUBLISHED' AND r.overallRating >= 2.5 AND r.overallRating < 3.5")
    long countThreeStarReviewsForListing(@Param("listingPublicId") String listingPublicId);

    @Query("SELECT COUNT(r) FROM Review r WHERE r.listingPublicId = :listingPublicId " +
            "AND r.status = 'PUBLISHED' AND r.overallRating >= 1.5 AND r.overallRating < 2.5")
    long countTwoStarReviewsForListing(@Param("listingPublicId") String listingPublicId);

    @Query("SELECT COUNT(r) FROM Review r WHERE r.listingPublicId = :listingPublicId " +
            "AND r.status = 'PUBLISHED' AND r.overallRating < 1.5")
    long countOneStarReviewsForListing(@Param("listingPublicId") String listingPublicId);

    // Recommendation count
    @Query("SELECT COUNT(r) FROM Review r WHERE r.listingPublicId = :listingPublicId " +
            "AND r.status = 'PUBLISHED' AND r.isRecommended = true")
    long countRecommendedForListing(@Param("listingPublicId") String listingPublicId);

    // Recent reviews
    @Query("SELECT COUNT(r) FROM Review r WHERE r.listingPublicId = :listingPublicId " +
            "AND r.status = 'PUBLISHED' AND r.createdAt >= :since")
    long countRecentReviewsForListing(
            @Param("listingPublicId") String listingPublicId,
            @Param("since") LocalDateTime since);

    // Reviews for host (across all their listings)
    @Query("SELECT r FROM Review r WHERE r.revieweePublicId = :hostPublicId " +
            "AND r.reviewType = 'HOST_REVIEW' AND r.status = 'PUBLISHED' " +
            "ORDER BY r.createdAt DESC")
    Page<Review> findHostReviews(@Param("hostPublicId") String hostPublicId, Pageable pageable);

    @Query("SELECT AVG(r.overallRating) FROM Review r WHERE r.revieweePublicId = :hostPublicId " +
            "AND r.reviewType = 'HOST_REVIEW' AND r.status = 'PUBLISHED'")
    Double getAverageRatingForHost(@Param("hostPublicId") String hostPublicId);

    // Reviews by guest
    @Query("SELECT r FROM Review r WHERE r.revieweePublicId = :guestPublicId " +
            "AND r.reviewType = 'GUEST_REVIEW' AND r.status = 'PUBLISHED' " +
            "ORDER BY r.createdAt DESC")
    Page<Review> findGuestReviews(@Param("guestPublicId") String guestPublicId, Pageable pageable);

    // Flagged reviews
    @Query("SELECT r FROM Review r WHERE r.status = 'FLAGGED' OR r.reportCount >= :threshold " +
            "ORDER BY r.reportCount DESC, r.flaggedAt DESC")
    Page<Review> findFlaggedReviews(@Param("threshold") int threshold, Pageable pageable);

    // Update helpful count
    @Modifying
    @Query("UPDATE Review r SET r.helpfulCount = r.helpfulCount + 1 WHERE r.publicId = :publicId")
    int incrementHelpfulCount(@Param("publicId") String publicId);

    @Modifying
    @Query("UPDATE Review r SET r.notHelpfulCount = r.notHelpfulCount + 1 WHERE r.publicId = :publicId")
    int incrementNotHelpfulCount(@Param("publicId") String publicId);

    @Modifying
    @Query("UPDATE Review r SET r.reportCount = r.reportCount + 1 WHERE r.publicId = :publicId")
    int incrementReportCount(@Param("publicId") String publicId);

    // Publish review
    @Modifying
    @Query("UPDATE Review r SET r.status = 'PUBLISHED', r.publishedAt = :publishedAt " +
            "WHERE r.publicId = :publicId")
    int publishReview(@Param("publicId") String publicId, @Param("publishedAt") LocalDateTime publishedAt);

    // Hide/Delete review
    @Modifying
    @Query("UPDATE Review r SET r.status = 'HIDDEN' WHERE r.publicId = :publicId")
    int hideReview(@Param("publicId") String publicId);

    @Modifying
    @Query("UPDATE Review r SET r.status = 'DELETED', r.deletedAt = :deletedAt " +
            "WHERE r.publicId = :publicId")
    int softDeleteReview(@Param("publicId") String publicId, @Param("deletedAt") LocalDateTime deletedAt);

    // Highlight review
    @Modifying
    @Query("UPDATE Review r SET r.isHighlighted = :highlighted WHERE r.publicId = :publicId")
    int setHighlighted(@Param("publicId") String publicId, @Param("highlighted") boolean highlighted);
}
