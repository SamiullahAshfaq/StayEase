package com.stayease.domain.serviceoffering.dto;

import com.stayease.domain.serviceoffering.entity.ServiceOffering.*;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalTime;
import java.util.List;

/**
 * DTO for creating new service offerings
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateServiceOfferingDTO {

    @NotNull(message = "Service category is required")
    private ServiceCategory category;

    @NotBlank(message = "Provider ID is required")
    private String providerPublicId;

    @NotBlank(message = "Title is required")
    @Size(min = 10, max = 200, message = "Title must be between 10 and 200 characters")
    private String title;

    @NotBlank(message = "Description is required")
    @Size(min = 100, max = 5000, message = "Description must be between 100 and 5000 characters")
    private String description;

    private String highlights;
    private String whatIsIncluded;
    private String whatToExpect;

    // Pricing
    @NotNull(message = "Pricing type is required")
    private PricingType pricingType;

    @NotNull(message = "Base price is required")
    @DecimalMin(value = "0.01", message = "Base price must be greater than 0")
    private BigDecimal basePrice;

    @DecimalMin(value = "0.00", message = "Extra person price cannot be negative")
    private BigDecimal extraPersonPrice;

    @DecimalMin(value = "0.00", message = "Weekend surcharge cannot be negative")
    private BigDecimal weekendSurcharge;

    @DecimalMin(value = "0.00", message = "Peak season surcharge cannot be negative")
    private BigDecimal peakSeasonSurcharge;

    // Capacity
    @Min(value = 1, message = "Minimum capacity must be at least 1")
    private Integer minCapacity;

    @Min(value = 1, message = "Maximum capacity must be at least 1")
    private Integer maxCapacity;

    // Duration
    @Min(value = 15, message = "Duration must be at least 15 minutes")
    private Integer durationMinutes;

    @Min(value = 1, message = "Minimum booking hours must be at least 1")
    private Integer minBookingHours;

    // Availability
    private Boolean isInstantBooking;
    private LocalTime availableFrom;
    private LocalTime availableTo;

    @Size(min = 1, message = "At least one available day is required")
    private List<String> availableDays;

    // Location
    @NotBlank(message = "City is required")
    private String city;

    @NotBlank(message = "Country is required")
    private String country;

    private String address;
    private String zipCode;
    private Double latitude;
    private Double longitude;
    private Integer serviceRadius;
    private Boolean providesMobileService;

    // Requirements
    private String requirements;
    private String cancellationPolicy;

    @Min(value = 1, message = "Advance booking hours must be at least 1")
    private Integer advanceBookingHours;

    private String safetyMeasures;

    // Languages & Amenities
    private List<String> languages;
    private List<String> amenities;

    // Media
    private List<String> imageUrls;
    private String videoUrl;

    // Verification
    private Boolean hasInsurance;
    private Boolean hasLicense;
    private String licenseNumber;
}
