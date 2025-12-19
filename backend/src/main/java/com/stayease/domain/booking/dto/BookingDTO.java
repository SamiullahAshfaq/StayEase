package com.stayease.domain.booking.dto;

import com.stayease.domain.booking.entity.Booking;
import lombok.*;
import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BookingDTO {
    private UUID publicId;
    private UUID listingPublicId;
    private UUID guestPublicId;
    private LocalDate checkInDate;
    private LocalDate checkOutDate;
    private Integer numberOfGuests;
    private Integer numberOfNights;
    private BigDecimal totalPrice;
    private String currency;
    private Booking.BookingStatus bookingStatus;
    private Booking.PaymentStatus paymentStatus;
    private String specialRequests;
    private String cancellationReason;
    private Instant cancelledAt;
    private List<BookingAddonDTO> addons;
    private Instant createdAt;
    private Instant updatedAt;

    // Additional fields for display
    private String listingTitle;
    private String listingCoverImage;
    private String guestName;
    private String guestEmail;
    private String guestPhone;
    private String guestAvatar;
    private String landlordPublicId;
}