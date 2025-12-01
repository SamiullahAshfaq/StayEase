package com.stayease.domain.listing.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

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

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "location", nullable = false)
    private String location;

    @Column(name = "price", nullable = false, precision = 12, scale = 2)
    private BigDecimal price;

    @Column(name = "currency", nullable = false, length = 10)
    @Builder.Default
    private String currency = "USD";

    @Column(name = "guests", nullable = false)
    private Integer guests;

    @Column(name = "bedrooms", nullable = false)
    private Integer bedrooms;

    @Column(name = "beds", nullable = false)
    private Integer beds;

    @Column(name = "bathrooms", nullable = false)
    private Integer bathrooms;

    @Column(name = "category", nullable = false, length = 100)
    private String category;

    @Column(name = "rules", columnDefinition = "TEXT")
    private String rules;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    @OneToMany(mappedBy = "listing", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<ListingImage> images = new ArrayList<>();

    @PrePersist
    protected void onCreate() {
        if (publicId == null) {
            publicId = UUID.randomUUID();
        }
    }

    public void addImage(ListingImage image) {
        images.add(image);
        image.setListing(this);
    }

    public void removeImage(ListingImage image) {
        images.remove(image);
        image.setListing(null);
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof Listing)) return false;
        Listing listing = (Listing) o;
        return publicId != null && publicId.equals(listing.publicId);
    }

    @Override
    public int hashCode() {
        return getClass().hashCode();
    }
}