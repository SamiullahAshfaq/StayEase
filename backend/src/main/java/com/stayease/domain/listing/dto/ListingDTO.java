package com.stayease.domain.listing.dto;

import com.stayease.domain.listing.entity.Listing;
import lombok.*;

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
    private String city;
    private String country;
    private BigDecimal latitude;
    private BigDecimal longitude;
    private String address;
    private BigDecimal pricePerNight;
    private String currency;
    private Integer maxGuests;
    private Integer bedrooms;
    private Integer beds;
    private BigDecimal bathrooms;
    private String propertyType;
    private String category;
    private List<String> amenities;
    private String houseRules;
    private String cancellationPolicy;
    private Integer minimumStay;
    private Integer maximumStay;
    private Boolean instantBook;
    private Listing.ListingStatus status;
    private List<ListingImageDTO> images;
    private Instant createdAt;
    private Instant updatedAt;
    
    // Computed fields for search results
    private Double averageRating;
    private Integer totalReviews;
    private String coverImageUrl;
}