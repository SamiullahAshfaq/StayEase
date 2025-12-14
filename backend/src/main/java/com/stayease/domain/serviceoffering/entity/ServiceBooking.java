package com.stayease.domain.serviceoffering.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

/**
 * Service Booking entity - Bookings for service offerings
 */
@Entity
@Table(name = "service_bookings", indexes = {
        @Index(name = "idx_service_booking_public_id", columnList = "publicId"),
        @Index(name = "idx_service_booking_service", columnList = "servicePublicId"),
        @Index(name = "idx_service_booking_customer", columnList = "customerPublicId"),
        @Index(name = "idx_service_booking_provider", columnList = "providerPublicId"),
        @Index(name = "idx_service_booking_status", columnList = "status"),
        @Index(name = "idx_service_booking_date", columnList = "bookingDate"),
        @Index(name = "idx_service_booking_created", columnList = "createdAt")
})
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(of = "id")
public class ServiceBooking {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "service_booking_seq")
    @SequenceGenerator(name = "service_booking_seq", sequenceName = "service_booking_sequence", allocationSize = 1)
    private Long id;

    @Column(nullable = false, unique = true, updatable = false)
    private String publicId;

    /**
     * Booking Status
     */
    public enum BookingStatus {
        PENDING, // Awaiting provider confirmation
        CONFIRMED, // Confirmed by provider
        PAID, // Payment completed
        IN_PROGRESS, // Service is being provided
        COMPLETED, // Service completed
        CANCELLED, // Cancelled by customer
        REJECTED, // Rejected by provider
        REFUNDED, // Payment refunded
        NO_SHOW // Customer didn't show up
    }

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private BookingStatus status = BookingStatus.PENDING;

    // Related entities
    @Column(nullable = false)
    private String servicePublicId;

    @Column(nullable = false)
    private String customerPublicId;

    @Column(nullable = false)
    private String providerPublicId;

    // Booking details
    @Column(nullable = false)
    private LocalDate bookingDate;

    private LocalTime startTime;
    private LocalTime endTime;

    private Integer durationMinutes;

    // Capacity
    @Column(nullable = false)
    @Builder.Default
    private Integer numberOfPeople = 1;

    private Integer numberOfItems; // For services priced per item

    // Location
    private String serviceLocation; // Where service will be provided
    private String customerAddress;
    private Double latitude;
    private Double longitude;

    /**
     * Pricing breakdown
     */
    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal basePrice;

    @Column(precision = 10, scale = 2)
    @Builder.Default
    private BigDecimal extraPersonCharge = BigDecimal.ZERO;

    @Column(precision = 10, scale = 2)
    @Builder.Default
    private BigDecimal surcharges = BigDecimal.ZERO; // Weekend/peak season

    @Column(precision = 10, scale = 2)
    @Builder.Default
    private BigDecimal discount = BigDecimal.ZERO;

    @Column(precision = 10, scale = 2)
    @Builder.Default
    private BigDecimal serviceFee = BigDecimal.ZERO;

    @Column(precision = 10, scale = 2)
    @Builder.Default
    private BigDecimal tax = BigDecimal.ZERO;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal totalPrice;

    /**
     * Payment
     */
    public enum PaymentStatus {
        PENDING,
        AUTHORIZED,
        CAPTURED,
        REFUNDED,
        FAILED
    }

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private PaymentStatus paymentStatus = PaymentStatus.PENDING;

    private String paymentIntentId; // Stripe payment intent
    private LocalDateTime paidAt;

    /**
     * Customer details
     */
    @Column(columnDefinition = "TEXT")
    private String specialRequests;

    private String customerPhone;
    private String customerEmail;

    /**
     * Provider actions
     */
    private LocalDateTime confirmedAt;
    private LocalDateTime rejectedAt;
    private String rejectionReason;

    private LocalDateTime serviceStartedAt;
    private LocalDateTime serviceCompletedAt;

    /**
     * Cancellation
     */
    private LocalDateTime cancelledAt;
    private String cancellationReason;

    @Column(nullable = false)
    @Builder.Default
    private Boolean isRefundable = true;

    private BigDecimal refundAmount;
    private LocalDateTime refundedAt;

    /**
     * Communication
     */
    @Column(nullable = false)
    @Builder.Default
    private Boolean hasUnreadMessages = false;

    private Integer messageCount;

    /**
     * Review
     */
    @Column(nullable = false)
    @Builder.Default
    private Boolean isReviewedByCustomer = false;

    @Column(nullable = false)
    @Builder.Default
    private Boolean isReviewedByProvider = false;

    private String reviewPublicId;

    /**
     * Timestamps
     */
    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(nullable = false)
    private LocalDateTime updatedAt;

    /**
     * Helper methods
     */

    public void confirm() {
        this.status = BookingStatus.CONFIRMED;
        this.confirmedAt = LocalDateTime.now();
    }

    public void reject(String reason) {
        this.status = BookingStatus.REJECTED;
        this.rejectedAt = LocalDateTime.now();
        this.rejectionReason = reason;
    }

    public void cancel(String reason) {
        this.status = BookingStatus.CANCELLED;
        this.cancelledAt = LocalDateTime.now();
        this.cancellationReason = reason;
    }

    public void markPaid() {
        this.status = BookingStatus.PAID;
        this.paymentStatus = PaymentStatus.CAPTURED;
        this.paidAt = LocalDateTime.now();
    }

    public void startService() {
        this.status = BookingStatus.IN_PROGRESS;
        this.serviceStartedAt = LocalDateTime.now();
    }

    public void complete() {
        this.status = BookingStatus.COMPLETED;
        this.serviceCompletedAt = LocalDateTime.now();
    }

    public void refund(BigDecimal amount) {
        this.status = BookingStatus.REFUNDED;
        this.paymentStatus = PaymentStatus.REFUNDED;
        this.refundAmount = amount;
        this.refundedAt = LocalDateTime.now();
    }

    public boolean canCancel() {
        return this.status == BookingStatus.PENDING
                || this.status == BookingStatus.CONFIRMED
                || this.status == BookingStatus.PAID;
    }

    public boolean canReview() {
        return this.status == BookingStatus.COMPLETED;
    }

    public BigDecimal calculateTotal() {
        BigDecimal total = this.basePrice;
        total = total.add(this.extraPersonCharge);
        total = total.add(this.surcharges);
        total = total.subtract(this.discount);
        total = total.add(this.serviceFee);
        total = total.add(this.tax);
        return total;
    }
}
