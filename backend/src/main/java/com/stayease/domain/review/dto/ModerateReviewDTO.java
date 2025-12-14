package com.stayease.domain.review.dto;

import com.stayease.domain.review.entity.Review.ReviewStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO for moderating reviews (admin only)
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ModerateReviewDTO {

    private ReviewStatus status;

    @NotBlank(message = "Moderation notes are required")
    @Size(max = 1000, message = "Moderation notes must not exceed 1000 characters")
    private String moderationNotes;

    @NotBlank(message = "Moderator ID is required")
    private String moderatedBy;
}
