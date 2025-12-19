package com.stayease.shared.mapper;

import com.stayease.domain.booking.dto.BookingAddonDTO;
import com.stayease.domain.booking.dto.BookingDTO;
import com.stayease.domain.booking.entity.Booking;
import com.stayease.domain.booking.entity.BookingAddon;
import com.stayease.domain.listing.entity.Listing;
import com.stayease.domain.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
public class BookingMapper {

    private final UserRepository userRepository;

    public BookingDTO toDTO(Booking booking, Listing listing) {
        if (booking == null) {
            return null;
        }

        BookingDTO dto = BookingDTO.builder()
                .publicId(booking.getPublicId())
                .listingPublicId(booking.getListingPublicId())
                .guestPublicId(booking.getGuestPublicId())
                .checkInDate(booking.getCheckInDate())
                .checkOutDate(booking.getCheckOutDate())
                .numberOfGuests(booking.getNumberOfGuests())
                .numberOfNights(booking.getNumberOfNights())
                .totalPrice(booking.getTotalPrice())
                .currency(booking.getCurrency())
                .bookingStatus(booking.getBookingStatus())
                .paymentStatus(booking.getPaymentStatus())
                .specialRequests(booking.getSpecialRequests())
                .cancellationReason(booking.getCancellationReason())
                .cancelledAt(booking.getCancelledAt())
                .addons(booking.getAddons() != null ? booking.getAddons().stream()
                        .map(this::toAddonDTO)
                        .collect(Collectors.toList()) : null)
                .createdAt(booking.getCreatedAt())
                .updatedAt(booking.getUpdatedAt())
                .build();

        // Fetch and populate guest information
        if (booking.getGuestPublicId() != null) {
            userRepository.findByPublicId(booking.getGuestPublicId()).ifPresent(guest -> {
                dto.setGuestName(guest.getFirstName() + " " + guest.getLastName());
                dto.setGuestEmail(guest.getEmail());
                dto.setGuestPhone(guest.getPhoneNumber());
                dto.setGuestAvatar(guest.getProfileImageUrl());
            });
        }

        if (listing != null) {
            dto.setListingTitle(listing.getTitle());
            dto.setLandlordPublicId(listing.getLandlordPublicId().toString());
            if (listing.getImages() != null && !listing.getImages().isEmpty()) {
                dto.setListingCoverImage(listing.getImages().stream()
                        .filter(img -> Boolean.TRUE.equals(img.getIsCover()))
                        .findFirst()
                        .or(() -> listing.getImages().stream().findFirst())
                        .map(img -> img.getUrl())
                        .orElse(null));
            }
        }

        return dto;
    }

    public BookingAddonDTO toAddonDTO(BookingAddon addon) {
        if (addon == null) {
            return null;
        }

        return BookingAddonDTO.builder()
                .id(addon.getId())
                .name(addon.getName())
                .description(addon.getDescription())
                .price(addon.getPrice())
                .quantity(addon.getQuantity())
                .build();
    }
}