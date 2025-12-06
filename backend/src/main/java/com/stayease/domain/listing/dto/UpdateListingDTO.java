package com.stayease.domain.listing.dto;

import com.stayease.domain.listing.entity.Listing;
import jakarta.validation.constraints.*;
import lombok.*;

import java.math.BigDecimal;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UpdateListingDTO {
    
    @Size(min = 10, max = 255, message = "Title must be between 10 and 255 characters")
    private String title;

    @Size(min = 50, max = 5000, message = "Description must be between 50 and 5000 characters")
    private String description;

    private String location;
    private String city;
    private String country;
    private BigDecimal latitude;
    private BigDecimal longitude;
    private String address;

    @DecimalMin(value = "1.0", message = "Price must be at least 1")
    @DecimalMax(value = "999999.99", message = "Price cannot exceed 999,999.99")
    private BigDecimal pricePerNight;

    private String currency;

    @Min(value = 1, message = "At least 1 guest must be allowed")
    @Max(value = 50, message = "Maximum 50 guests allowed")
    private Integer maxGuests;

    @Min(value = 0, message = "Bedrooms cannot be negative")
    @Max(value = 50, message = "Maximum 50 bedrooms")
    private Integer bedrooms;

    @Min(value = 1, message = "At least 1 bed is required")
    @Max(value = 100, message = "Maximum 100 beds")
    private Integer beds;

    @DecimalMin(value = "0.5", message = "At least 0.5 bathrooms required")
    @DecimalMax(value = "50.0", message = "Maximum 50 bathrooms")
    private BigDecimal bathrooms;

    private String propertyType;
    private String category;
    private List<String> amenities;
    private String houseRules;
    private String cancellationPolicy;
    
    @Min(value = 1, message = "Minimum stay must be at least 1 night")
    private Integer minimumStay;
    
    @Max(value = 365, message = "Maximum stay cannot exceed 365 nights")
    private Integer maximumStay;
    
    private Boolean instantBook;
    private Listing.ListingStatus status;
    private List<ListingImageDTO> images;
}