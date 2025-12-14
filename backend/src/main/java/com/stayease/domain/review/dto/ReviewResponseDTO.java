package com.stayease.domain.review.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO for adding a response to a review
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReviewResponseDTO {

    @NotBlank(message = "Response text is required")
    @Size(min = 10, max = 2000, message = "Response must be between 10 and 2000 characters")
    private String publicResponse;
}
