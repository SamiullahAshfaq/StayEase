package com.stayease.domain.serviceoffering.dto;

import com.stayease.domain.serviceoffering.entity.ServiceBooking.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

/**
 * DTO for Service Booking responses
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ServiceBookingDTO {

    private String publicId;
    private BookingStatus status;
    private PaymentStatus paymentStatus;

    // Service info
    private String servicePublicId;
    private String serviceTitle;
    private String serviceCategory;
    private String serviceImageUrl;

    // Customer info
    private String customerPublicId;
    private String customerName;
    private String customerAvatarUrl;
    private String customerPhone;
    private String customerEmail;

    // Provider info
    private String providerPublicId;
    private String providerName;
    private String providerAvatarUrl;

    // Booking details
    private LocalDate bookingDate;
    private LocalTime startTime;
    private LocalTime endTime;
    private Integer durationMinutes;
    private Integer numberOfPeople;
    private Integer numberOfItems;

    // Location
    private String serviceLocation;
    private String customerAddress;

    // Pricing
    private BigDecimal basePrice;
    private BigDecimal extraPersonCharge;
    private BigDecimal surcharges;
    private BigDecimal discount;
    private BigDecimal serviceFee;
    private BigDecimal tax;
    private BigDecimal totalPrice;

    // Customer details
    private String specialRequests;

    // Status timestamps
    private LocalDateTime confirmedAt;
    private LocalDateTime rejectedAt;
    private String rejectionReason;
    private LocalDateTime cancelledAt;
    private String cancellationReason;
    private LocalDateTime paidAt;
    private LocalDateTime serviceStartedAt;
    private LocalDateTime serviceCompletedAt;

    // Refund
    private Boolean isRefundable;
    private BigDecimal refundAmount;
    private LocalDateTime refundedAt;

    // Review
    private Boolean isReviewedByCustomer;
    private Boolean isReviewedByProvider;

    // Timestamps
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // Computed fields
    private Boolean canCancel;
    private Boolean canReview;
    private String statusDisplay;
}
