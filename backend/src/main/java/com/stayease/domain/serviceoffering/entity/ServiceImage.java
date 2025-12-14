package com.stayease.domain.serviceoffering.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

/**
 * Service Image entity - Photos for service offerings
 */
@Entity
@Table(name = "service_images", indexes = {
        @Index(name = "idx_service_image_service", columnList = "service_id"),
        @Index(name = "idx_service_image_primary", columnList = "isPrimary")
})
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(of = "id")
public class ServiceImage {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "service_image_seq")
    @SequenceGenerator(name = "service_image_seq", sequenceName = "service_image_sequence", allocationSize = 1)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "service_id", nullable = false)
    @ToString.Exclude
    private ServiceOffering serviceOffering;

    @Column(nullable = false)
    private String imageUrl;

    private String caption;

    @Column(nullable = false)
    @Builder.Default
    private Boolean isPrimary = false; // Main display image

    @Column(nullable = false)
    @Builder.Default
    private Integer displayOrder = 0;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime uploadedAt;
}
