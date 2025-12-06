package com.stayease.domain.listing.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ListingImageDTO {
    
    private Long id;
    
    @NotBlank(message = "Image URL is required")
    private String url;
    
    private String caption;
    @Builder.Default
    private Boolean isCover = false;
    @Builder.Default
    private Integer sortOrder = 0;
}