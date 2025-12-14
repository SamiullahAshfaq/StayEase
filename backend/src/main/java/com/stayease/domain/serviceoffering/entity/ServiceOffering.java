package com.stayease.domain.serviceoffering.entity;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import jakarta.persistence.CascadeType;
import jakarta.persistence.CollectionTable;
import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToMany;
import jakarta.persistence.SequenceGenerator;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

/**
 * Service Offering entity - Additional services like home chef, tour guide, car
 * rental, etc.
 */
@Entity
@Table(name = "service_offerings", indexes = {
        @Index(name = "idx_service_public_id", columnList = "publicId"),
        @Index(name = "idx_service_provider", columnList = "providerPublicId"),
        @Index(name = "idx_service_category", columnList = "category"),
        @Index(name = "idx_service_status", columnList = "status"),
        @Index(name = "idx_service_location", columnList = "city, country"),
        @Index(name = "idx_service_active", columnList = "isActive, status"),
        @Index(name = "idx_service_featured", columnList = "isFeatured"),
        @Index(name = "idx_service_rating", columnList = "averageRating")
})
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(of = "id")
public class ServiceOffering {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "service_offering_seq")
    @SequenceGenerator(name = "service_offering_seq", sequenceName = "service_offering_sequence", allocationSize = 1)
    private Long id;

    @Column(nullable = false, unique = true, updatable = false)
    private String publicId;

    /**
     * Service Categories (10+ types of services)
     */
    public enum ServiceCategory {
        HOME_CHEF, // Personal chef for home cooking
        TOUR_GUIDE, // Local tour guide services
        CAR_RENTAL, // Vehicle rental service
        AIRPORT_TRANSFER, // Airport pickup/drop-off
        LAUNDRY_SERVICE, // Laundry and dry cleaning
        HOUSE_CLEANING, // Professional cleaning service
        MASSAGE_SPA, // In-home massage and spa
        PHOTOGRAPHY, // Professional photography
        EVENT_PLANNING, // Event organization
        BABY_SITTING, // Child care services
        PET_CARE, // Pet sitting/walking
        GROCERY_DELIVERY, // Grocery shopping and delivery
        PERSONAL_TRAINER, // Fitness training
        YOGA_MEDITATION, // Yoga/meditation sessions
        LANGUAGE_TUTOR, // Language lessons
        BIKE_RENTAL, // Bicycle rental
        EQUIPMENT_RENTAL // Sports/camping equipment rental
    }

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ServiceCategory category;

    /**
     * Service Status
     */
    public enum ServiceStatus {
        DRAFT, // Being created
        PENDING_APPROVAL, // Waiting for admin approval
        ACTIVE, // Live and bookable
        PAUSED, // Temporarily unavailable
        SUSPENDED, // Suspended by admin
        REJECTED, // Rejected by admin
        INACTIVE // Deactivated by provider
    }

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private ServiceStatus status = ServiceStatus.DRAFT;

    // Provider info
    @Column(nullable = false)
    private String providerPublicId;

    // Basic information
    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String description;

    @Column(columnDefinition = "TEXT")
    private String highlights; // Key features, comma-separated or JSON

    @Column(columnDefinition = "TEXT")
    private String whatIsIncluded; // What's included in the service

    @Column(columnDefinition = "TEXT")
    private String whatToExpect; // What customers should expect

    /**
     * Pricing
     */
    public enum PricingType {
        PER_HOUR, // Hourly rate
        PER_DAY, // Daily rate
        PER_PERSON, // Per person pricing
        PER_SESSION, // Fixed session price
        PER_ITEM, // Per item (e.g., laundry per kg)
        CUSTOM // Custom pricing
    }

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PricingType pricingType;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal basePrice;

    @Column(precision = 10, scale = 2)
    private BigDecimal extraPersonPrice; // Additional cost per extra person

    @Column(precision = 10, scale = 2)
    private BigDecimal weekendSurcharge; // Weekend pricing surcharge

    @Column(precision = 10, scale = 2)
    private BigDecimal peakSeasonSurcharge; // Peak season surcharge

    // Capacity
    private Integer minCapacity; // Minimum people/items
    private Integer maxCapacity; // Maximum people/items

    // Duration
    private Integer durationMinutes; // Service duration in minutes
    private Integer minBookingHours; // Minimum booking duration

    /**
     * Availability
     */
    @Column(nullable = false)
    @Builder.Default
    private Boolean isActive = false;

    @Column(nullable = false)
    @Builder.Default
    private Boolean isInstantBooking = false; // Auto-confirm bookings

    private LocalTime availableFrom; // Start time (e.g., 09:00)
    private LocalTime availableTo; // End time (e.g., 18:00)

    @ElementCollection
    @CollectionTable(name = "service_available_days", joinColumns = @JoinColumn(name = "service_id"))
    @Column(name = "day_of_week")
    @Builder.Default
    private List<String> availableDays = new ArrayList<>(); // MONDAY, TUESDAY, etc.

    /**
     * Location
     */
    @Column(nullable = false)
    private String city;

    @Column(nullable = false)
    private String country;

    private String address;
    private String zipCode;

    private Double latitude;
    private Double longitude;

    private Integer serviceRadius; // Service area radius in km

    @Column(nullable = false)
    @Builder.Default
    private Boolean providesMobileService = false; // Comes to customer location

    /**
     * Requirements & Policies
     */
    @Column(columnDefinition = "TEXT")
    private String requirements; // What customers need to bring/prepare

    @Column(columnDefinition = "TEXT")
    private String cancellationPolicy;

    private Integer advanceBookingHours; // How many hours in advance to book

    @Column(columnDefinition = "TEXT")
    private String safetyMeasures; // COVID-19 and other safety measures

    /**
     * Languages
     */
    @ElementCollection
    @CollectionTable(name = "service_languages", joinColumns = @JoinColumn(name = "service_id"))
    @Column(name = "language")
    @Builder.Default
    private List<String> languages = new ArrayList<>();

    /**
     * Amenities/Equipment provided
     */
    @ElementCollection
    @CollectionTable(name = "service_amenities", joinColumns = @JoinColumn(name = "service_id"))
    @Column(name = "amenity")
    @Builder.Default
    private List<String> amenities = new ArrayList<>();

    /**
     * Media
     */
    @OneToMany(mappedBy = "serviceOffering", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<ServiceImage> images = new ArrayList<>();

    private String videoUrl; // Promotional video URL

    /**
     * Reviews & Rating
     */
    @Column
    @Builder.Default
    private Double averageRating = 0.0;

    @Column(nullable = false)
    @Builder.Default
    private Integer totalReviews = 0;

    @Column(nullable = false)
    @Builder.Default
    private Integer totalBookings = 0;

    /**
     * Verification & Trust
     */
    @Column(nullable = false)
    @Builder.Default
    private Boolean isVerified = false; // Provider verification

    @Column(nullable = false)
    @Builder.Default
    private Boolean hasInsurance = false;

    @Column(nullable = false)
    @Builder.Default
    private Boolean hasLicense = false;

    private String licenseNumber;
    private LocalDateTime licenseExpiryDate;

    /**
     * Promotion & Visibility
     */
    @Column(nullable = false)
    @Builder.Default
    private Boolean isFeatured = false;

    private LocalDateTime featuredUntil;

    @Column(precision = 5, scale = 2)
    private BigDecimal discountPercentage; // Active discount

    private LocalDateTime discountValidUntil;

    /**
     * Statistics
     */
    @Column(nullable = false)
    @Builder.Default
    private Integer viewCount = 0;

    @Column(nullable = false)
    @Builder.Default
    private Integer favoriteCount = 0;

    @Column(nullable = false)
    @Builder.Default
    private Integer inquiryCount = 0;

    /**
     * Moderation
     */
    private String rejectionReason;
    private LocalDateTime approvedAt;
    private String approvedBy;

    /**
     * Timestamps
     */
    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(nullable = false)
    private LocalDateTime updatedAt;

    private LocalDateTime lastBookedAt;

    /**
     * Helper methods
     */

    public void addImage(ServiceImage image) {
        images.add(image);
        image.setServiceOffering(this);
    }

    public void removeImage(ServiceImage image) {
        images.remove(image);
        image.setServiceOffering(null);
    }

    public void activate() {
        this.isActive = true;
        this.status = ServiceStatus.ACTIVE;
    }

    public void deactivate() {
        this.isActive = false;
        this.status = ServiceStatus.INACTIVE;
    }

    public void approve(String approvedBy) {
        this.status = ServiceStatus.ACTIVE;
        this.approvedAt = LocalDateTime.now();
        this.approvedBy = approvedBy;
        this.isActive = true;
    }

    public void reject(String reason) {
        this.status = ServiceStatus.REJECTED;
        this.rejectionReason = reason;
        this.isActive = false;
    }

    public void incrementViews() {
        this.viewCount++;
    }

    public void incrementFavorites() {
        this.favoriteCount++;
    }

    public void incrementInquiries() {
        this.inquiryCount++;
    }

    public void updateRating(Double newRating) {
        if (this.totalReviews == 0) {
            this.averageRating = newRating;
            this.totalReviews = 1;
        } else {
            double total = (this.averageRating * this.totalReviews) + newRating;
            this.totalReviews++;
            this.averageRating = total / this.totalReviews;
            this.averageRating = Math.round(this.averageRating * 100.0) / 100.0;
        }
    }

    public BigDecimal calculateFinalPrice() {
        BigDecimal finalPrice = this.basePrice;

        if (this.discountPercentage != null && this.discountValidUntil != null
                && LocalDateTime.now().isBefore(this.discountValidUntil)) {
            BigDecimal discount = finalPrice.multiply(this.discountPercentage)
                    .divide(BigDecimal.valueOf(100));
            finalPrice = finalPrice.subtract(discount);
        }

        return finalPrice;
    }

    public boolean isBookable() {
        return this.isActive && this.status == ServiceStatus.ACTIVE;
    }

    public boolean isFeaturedNow() {
        return this.isFeatured && (this.featuredUntil == null
                || LocalDateTime.now().isBefore(this.featuredUntil));
    }
}
