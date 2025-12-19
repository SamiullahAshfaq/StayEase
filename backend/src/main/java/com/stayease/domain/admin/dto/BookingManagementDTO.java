package com.stayease.domain.admin.dto;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BookingManagementDTO {

    private UUID publicId;
    private String listingTitle;
    private String listingLocation;
    private String guestName;
    private String guestEmail;
    private String landlordName;
    private String landlordEmail;
    private LocalDate checkInDate;
    private LocalDate checkOutDate;
    private Integer numberOfGuests;
    private BigDecimal totalPrice;
    private String currency;
    private String bookingStatus;
    private String paymentStatus;
    private Instant createdAt;
    private Instant updatedAt;
}
