// ListingDTO.java
package com.stayease.domain.listing.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ListingDTO {
    private UUID publicId;
    private UUID landlordPublicId;
    private String title;
    private String description;
    private String location;
    private BigDecimal price;
    private String currency;
    private Integer guests;
    private Integer bedrooms;
    private Integer beds;
    private Integer bathrooms;
    private String category;
    private String rules;
    private List<ListingImageDTO> images;
    private Instant createdAt;
    private Instant updatedAt;
}