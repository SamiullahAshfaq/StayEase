package com.stayease.domain.listing.dto;

import jakarta.validation.constraints.*;
import lombok.*;

import java.math.BigDecimal;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateListingDTO {

    @NotBlank(message = "Title is required")
    @Size(min = 10, max = 255, message = "Title must be between 10 and 255 characters")
    private String title;

    @NotBlank(message = "Description is required")
    @Size(min = 50, max = 5000, message = "Description must be between 50 and 5000 characters")
    private String description;

    @NotBlank(message = "Location is required")
    private String location;

    @NotBlank(message = "City is required")
    private String city;

    @NotBlank(message = "Country is required")
    private String country;

    private BigDecimal latitude;
    private BigDecimal longitude;
    private String address;

    @NotNull(message = "Price per night is required")
    @DecimalMin(value = "1.0", message = "Price must be at least 1")
    @DecimalMax(value = "999999.99", message = "Price cannot exceed 999,999.99")
    private BigDecimal pricePerNight;

    @Builder.Default
    private String currency = "USD";

    @NotNull(message = "Maximum guests is required")
    @Min(value = 1, message = "At least 1 guest must be allowed")
    @Max(value = 50, message = "Maximum 50 guests allowed")
    private Integer maxGuests;

    @NotNull(message = "Number of bedrooms is required")
    @Min(value = 0, message = "Bedrooms cannot be negative")
    @Max(value = 50, message = "Maximum 50 bedrooms")
    private Integer bedrooms;

    @NotNull(message = "Number of beds is required")
    @Min(value = 1, message = "At least 1 bed is required")
    @Max(value = 100, message = "Maximum 100 beds")
    private Integer beds;

    @NotNull(message = "Number of bathrooms is required")
    @DecimalMin(value = "0.5", message = "At least 0.5 bathrooms required")
    @DecimalMax(value = "50.0", message = "Maximum 50 bathrooms")
    private BigDecimal bathrooms;

    @NotBlank(message = "Property type is required")
    private String propertyType;

    @NotBlank(message = "Category is required")
    private String category;

    private List<String> amenities;
    private String houseRules;
    @Builder.Default
    private String cancellationPolicy = "FLEXIBLE";

    @Builder.Default
    @Min(value = 1, message = "Minimum stay must be at least 1 night")
    private Integer minimumStay = 1;

    @Max(value = 365, message = "Maximum stay cannot exceed 365 nights")
    private Integer maximumStay;

    @Builder.Default
    private Boolean instantBook = false;

    @NotEmpty(message = "At least one image is required")
    private List<ListingImageDTO> images;

    // Status field - determines if listing is saved as draft or published
    // If not provided, defaults to DRAFT to allow landlords to save incomplete
    // listings
    @Builder.Default
    private String status = "DRAFT";
}