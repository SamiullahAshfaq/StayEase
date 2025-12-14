package com.stayease.domain.review.controller;

import com.stayease.domain.review.dto.*;
import com.stayease.domain.review.service.ReviewService;
import com.stayease.shared.dto.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/reviews")
@RequiredArgsConstructor
@Slf4j
public class ReviewController {

    private final ReviewService reviewService;

    /**
     * Create a new review
     */
    @PostMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<ReviewDTO>> createReview(
            @Valid @RequestBody CreateReviewDTO dto,
            @AuthenticationPrincipal UserDetails userDetails) {
        log.info("Creating review by user: {}", userDetails.getUsername());
        // Ensure the reviewer is the authenticated user
        dto.setReviewerPublicId(userDetails.getUsername());

        ReviewDTO review = reviewService.createReview(dto);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(review, "Review created successfully"));
    }

    /**
     * Get a specific review
     */
    @GetMapping("/{publicId}")
    public ResponseEntity<ApiResponse<ReviewDTO>> getReview(@PathVariable String publicId) {
        ReviewDTO review = reviewService.getReview(publicId);
        return ResponseEntity.ok(ApiResponse.success(review, "Review retrieved successfully"));
    }

    /**
     * Get reviews for a listing
     */
    @GetMapping("/listing/{listingPublicId}")
    public ResponseEntity<ApiResponse<Page<ReviewDTO>>> getListingReviews(
            @PathVariable String listingPublicId,
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        Page<ReviewDTO> reviews = reviewService.getListingReviews(listingPublicId, pageable);
        return ResponseEntity.ok(ApiResponse.success(reviews, "Listing reviews retrieved successfully"));
    }

    /**
     * Get highlighted reviews for a listing
     */
    @GetMapping("/listing/{listingPublicId}/highlighted")
    public ResponseEntity<ApiResponse<List<ReviewDTO>>> getHighlightedReviews(
            @PathVariable String listingPublicId) {
        List<ReviewDTO> reviews = reviewService.getHighlightedReviews(listingPublicId);
        return ResponseEntity.ok(ApiResponse.success(reviews, "Highlighted reviews retrieved successfully"));
    }

    /**
     * Get review statistics for a listing
     */
    @GetMapping("/listing/{listingPublicId}/statistics")
    public ResponseEntity<ApiResponse<ReviewStatisticsDTO>> getListingStatistics(
            @PathVariable String listingPublicId) {
        ReviewStatisticsDTO statistics = reviewService.getListingStatistics(listingPublicId);
        return ResponseEntity.ok(ApiResponse.success(statistics, "Statistics retrieved successfully"));
    }

    /**
     * Get reviews written by current user
     */
    @GetMapping("/my-reviews")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<Page<ReviewDTO>>> getMyReviews(
            @AuthenticationPrincipal UserDetails userDetails,
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        String userPublicId = userDetails.getUsername();
        Page<ReviewDTO> reviews = reviewService.getUserReviews(userPublicId, pageable);
        return ResponseEntity.ok(ApiResponse.success(reviews, "Your reviews retrieved successfully"));
    }

    /**
     * Get reviews about a host
     */
    @GetMapping("/host/{hostPublicId}")
    public ResponseEntity<ApiResponse<Page<ReviewDTO>>> getHostReviews(
            @PathVariable String hostPublicId,
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        Page<ReviewDTO> reviews = reviewService.getHostReviews(hostPublicId, pageable);
        return ResponseEntity.ok(ApiResponse.success(reviews, "Host reviews retrieved successfully"));
    }

    /**
     * Get reviews about a guest
     */
    @GetMapping("/guest/{guestPublicId}")
    public ResponseEntity<ApiResponse<Page<ReviewDTO>>> getGuestReviews(
            @PathVariable String guestPublicId,
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        Page<ReviewDTO> reviews = reviewService.getGuestReviews(guestPublicId, pageable);
        return ResponseEntity.ok(ApiResponse.success(reviews, "Guest reviews retrieved successfully"));
    }

    /**
     * Update a review (only if pending or flagged)
     */
    @PatchMapping("/{publicId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<ReviewDTO>> updateReview(
            @PathVariable String publicId,
            @Valid @RequestBody UpdateReviewDTO dto,
            @AuthenticationPrincipal UserDetails userDetails) {
        String userPublicId = userDetails.getUsername();
        ReviewDTO review = reviewService.updateReview(publicId, dto, userPublicId);
        return ResponseEntity.ok(ApiResponse.success(review, "Review updated successfully"));
    }

    /**
     * Add response to a review
     */
    @PostMapping("/{publicId}/response")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<ReviewDTO>> addResponse(
            @PathVariable String publicId,
            @Valid @RequestBody ReviewResponseDTO dto,
            @AuthenticationPrincipal UserDetails userDetails) {
        String userPublicId = userDetails.getUsername();
        ReviewDTO review = reviewService.addResponse(publicId, dto, userPublicId);
        return ResponseEntity.ok(ApiResponse.success(review, "Response added successfully"));
    }

    /**
     * Publish a review immediately
     */
    @PostMapping("/{publicId}/publish")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<ReviewDTO>> publishReview(
            @PathVariable String publicId,
            @AuthenticationPrincipal UserDetails userDetails) {
        String userPublicId = userDetails.getUsername();
        ReviewDTO review = reviewService.publishReview(publicId, userPublicId);
        return ResponseEntity.ok(ApiResponse.success(review, "Review published successfully"));
    }

    /**
     * Mark review as helpful
     */
    @PostMapping("/{publicId}/helpful")
    public ResponseEntity<ApiResponse<Void>> markHelpful(@PathVariable String publicId) {
        reviewService.markHelpful(publicId);
        return ResponseEntity.ok(ApiResponse.success(null, "Marked as helpful"));
    }

    /**
     * Mark review as not helpful
     */
    @PostMapping("/{publicId}/not-helpful")
    public ResponseEntity<ApiResponse<Void>> markNotHelpful(@PathVariable String publicId) {
        reviewService.markNotHelpful(publicId);
        return ResponseEntity.ok(ApiResponse.success(null, "Marked as not helpful"));
    }

    /**
     * Report a review
     */
    @PostMapping("/{publicId}/report")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<Void>> reportReview(
            @PathVariable String publicId,
            @RequestBody Map<String, String> body) {
        String reason = body.get("reason");
        reviewService.reportReview(publicId, reason);
        return ResponseEntity.ok(ApiResponse.success(null, "Review reported successfully"));
    }

    /**
     * Delete a review
     */
    @DeleteMapping("/{publicId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<Void>> deleteReview(
            @PathVariable String publicId,
            @AuthenticationPrincipal UserDetails userDetails) {
        String userPublicId = userDetails.getUsername();
        reviewService.deleteReview(publicId, userPublicId);
        return ResponseEntity.ok(ApiResponse.success(null, "Review deleted successfully"));
    }

    /**
     * Moderate a review (admin only)
     */
    @PostMapping("/{publicId}/moderate")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<ReviewDTO>> moderateReview(
            @PathVariable String publicId,
            @Valid @RequestBody ModerateReviewDTO dto) {
        ReviewDTO review = reviewService.moderateReview(publicId, dto);
        return ResponseEntity.ok(ApiResponse.success(review, "Review moderated successfully"));
    }

    /**
     * Toggle review highlight (admin/host only)
     */
    @PostMapping("/{publicId}/highlight")
    @PreAuthorize("hasAnyRole('ADMIN', 'HOST')")
    public ResponseEntity<ApiResponse<ReviewDTO>> toggleHighlight(
            @PathVariable String publicId,
            @RequestBody Map<String, Boolean> body) {
        boolean highlight = body.getOrDefault("highlight", true);
        ReviewDTO review = reviewService.toggleHighlight(publicId, highlight);
        return ResponseEntity.ok(ApiResponse.success(review,
                highlight ? "Review highlighted" : "Review unhighlighted"));
    }

    /**
     * Get flagged reviews (admin only)
     */
    @GetMapping("/flagged")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Page<ReviewDTO>>> getFlaggedReviews(
            @PageableDefault(size = 20, sort = "reportCount", direction = Sort.Direction.DESC) Pageable pageable) {
        Page<ReviewDTO> reviews = reviewService.getFlaggedReviews(pageable);
        return ResponseEntity.ok(ApiResponse.success(reviews, "Flagged reviews retrieved successfully"));
    }
}
