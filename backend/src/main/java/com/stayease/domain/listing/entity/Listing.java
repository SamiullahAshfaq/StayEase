package com.stayease.domain.listing.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "listing")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Listing {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "listing_seq")
    @SequenceGenerator(name = "listing_seq", sequenceName = "listing_seq", allocationSize = 50)
    private Long id;

    @Column(name = "public_id", nullable = false, unique = true, updatable = false)
    private UUID publicId;

    @Column(name = "landlord_public_id", nullable = false)
    private UUID landlordPublicId;

    @Column(name = "title", nullable = false)
    private String title;

    @Column(name = "description", nullable = false, columnDefinition = "TEXT")
    private String description;

    @Column(name = "location", nullable = false)
    private String location;

    @Column(name = "city", nullable = false)
    private String city;

    @Column(name = "country", nullable = false)
    private String country;

    @Column(name = "latitude", precision = 10, scale = 8)
    private BigDecimal latitude;

    @Column(name = "longitude", precision = 11, scale = 8)
    private BigDecimal longitude;

    @Column(name = "address", columnDefinition = "TEXT")
    private String address;

    @Column(name = "price_per_night", nullable = false, precision = 12, scale = 2)
    private BigDecimal pricePerNight;

    @Column(name = "currency", nullable = false, length = 10)
    @Builder.Default
    private String currency = "USD";

    @Column(name = "max_guests", nullable = false)
    private Integer maxGuests;

    @Column(name = "bedrooms", nullable = false)
    private Integer bedrooms;

    @Column(name = "beds", nullable = false)
    private Integer beds;

    @Column(name = "bathrooms", nullable = false, precision = 3, scale = 1)
    private BigDecimal bathrooms;

    @Column(name = "property_type", nullable = false, length = 50)
    private String propertyType;

    @Column(name = "category", nullable = false, length = 100)
    private String category;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "amenities", columnDefinition = "jsonb")
    @Builder.Default
    private List<String> amenities = new ArrayList<>();

    @Column(name = "house_rules", columnDefinition = "TEXT")
    private String houseRules;

    @Column(name = "cancellation_policy", length = 50)
    @Builder.Default
    private String cancellationPolicy = "FLEXIBLE";

    @Column(name = "minimum_stay")
    @Builder.Default
    private Integer minimumStay = 1;

    @Column(name = "maximum_stay")
    private Integer maximumStay;

    @Column(name = "instant_book")
    @Builder.Default
    private Boolean instantBook = false;

    @Column(name = "status", nullable = false, length = 20)
    @Enumerated(EnumType.STRING)
    @Builder.Default
    private ListingStatus status = ListingStatus.ACTIVE;

    @OneToMany(mappedBy = "listing", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @OrderBy("sortOrder ASC")
    @Builder.Default
    private List<ListingImage> images = new ArrayList<>();

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    @PrePersist
    protected void onCreate() {
        if (publicId == null) {
            publicId = UUID.randomUUID();
        }
        createdAt = Instant.now();
        updatedAt = Instant.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = Instant.now();
    }

    public void addImage(ListingImage image) {
        images.add(image);
        image.setListing(this);
    }

    public void removeImage(ListingImage image) {
        images.remove(image);
        image.setListing(null);
    }

    public enum ListingStatus {
        ACTIVE,
        INACTIVE,
        PENDING_APPROVAL,
        SUSPENDED,
        DELETED
    }
}