package com.stayease.domain.serviceoffering.dto;

import com.stayease.domain.serviceoffering.entity.ServiceOffering.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

/**
 * DTO for Service Offering responses
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ServiceOfferingDTO {

    private String publicId;
    private ServiceCategory category;
    private ServiceStatus status;

    // Provider info
    private String providerPublicId;
    private String providerName;
    private String providerAvatarUrl;
    private Boolean providerIsVerified;

    // Basic info
    private String title;
    private String description;
    private String highlights;
    private String whatIsIncluded;
    private String whatToExpect;

    // Pricing
    private PricingType pricingType;
    private BigDecimal basePrice;
    private BigDecimal extraPersonPrice;
    private BigDecimal weekendSurcharge;
    private BigDecimal peakSeasonSurcharge;
    private BigDecimal finalPrice; // After discount
    private BigDecimal discountPercentage;

    // Capacity
    private Integer minCapacity;
    private Integer maxCapacity;

    // Duration
    private Integer durationMinutes;
    private Integer minBookingHours;

    // Availability
    private Boolean isActive;
    private Boolean isInstantBooking;
    private LocalTime availableFrom;
    private LocalTime availableTo;
    private List<String> availableDays;

    // Location
    private String city;
    private String country;
    private String address;
    private Double latitude;
    private Double longitude;
    private Integer serviceRadius;
    private Boolean providesMobileService;

    // Requirements
    private String requirements;
    private String cancellationPolicy;
    private Integer advanceBookingHours;
    private String safetyMeasures;

    // Languages & Amenities
    private List<String> languages;
    private List<String> amenities;

    // Media
    private List<ServiceImageDTO> images;
    private String videoUrl;

    // Reviews & Rating
    private Double averageRating;
    private Integer totalReviews;
    private Integer totalBookings;

    // Verification
    private Boolean isVerified;
    private Boolean hasInsurance;
    private Boolean hasLicense;

    // Promotion
    private Boolean isFeatured;
    private Boolean hasActiveDiscount;

    // Statistics
    private Integer viewCount;
    private Integer favoriteCount;

    // Timestamps
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // Computed fields
    private Boolean isBookable;
    private String categoryDisplayName;
    private String priceDisplay;
}
