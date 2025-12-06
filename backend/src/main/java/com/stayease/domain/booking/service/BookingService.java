package com.stayease.domain.booking.service;

import com.stayease.domain.booking.dto.*;
import com.stayease.domain.booking.entity.Booking;
import com.stayease.domain.booking.entity.BookingAddon;
import com.stayease.domain.booking.repository.BookingRepository;
import com.stayease.domain.listing.entity.Listing;
import com.stayease.domain.listing.repository.ListingRepository;
import com.stayease.exception.BadRequestException;
import com.stayease.exception.ForbiddenException;
import com.stayease.exception.NotFoundException;
import com.stayease.shared.mapper.BookingMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class BookingService {

    private final BookingRepository bookingRepository;
    private final ListingRepository listingRepository;
    private final BookingMapper bookingMapper;

    public BookingDTO createBooking(CreateBookingDTO dto, UUID guestPublicId) {
        log.info("Creating booking for listing: {} by guest: {}", dto.getListingPublicId(), guestPublicId);

        // Validate dates
        if (dto.getCheckOutDate().isBefore(dto.getCheckInDate()) || 
            dto.getCheckOutDate().isEqual(dto.getCheckInDate())) {
            throw new BadRequestException("Check-out date must be after check-in date");
        }

        // Get listing
        Listing listing = listingRepository.findByPublicId(dto.getListingPublicId())
                .orElseThrow(() -> new NotFoundException("Listing not found"));

        // Check if guest is trying to book their own listing
        if (listing.getLandlordPublicId().equals(guestPublicId)) {
            throw new BadRequestException("You cannot book your own listing");
        }

        // Validate guest count
        if (dto.getNumberOfGuests() > listing.getMaxGuests()) {
            throw new BadRequestException("Number of guests exceeds maximum capacity");
        }

        // Check for conflicting bookings
        List<Booking> conflicts = bookingRepository.findConflictingBookings(
                dto.getListingPublicId(),
                dto.getCheckInDate(),
                dto.getCheckOutDate()
        );

        if (!conflicts.isEmpty()) {
            throw new BadRequestException("Listing is not available for selected dates");
        }

        // Calculate nights and total price
        long nights = ChronoUnit.DAYS.between(dto.getCheckInDate(), dto.getCheckOutDate());
        BigDecimal basePrice = listing.getPricePerNight().multiply(BigDecimal.valueOf(nights));
        
        BigDecimal addonsTotal = BigDecimal.ZERO;
        if (dto.getAddons() != null) {
            addonsTotal = dto.getAddons().stream()
                    .map(addon -> addon.getPrice().multiply(BigDecimal.valueOf(addon.getQuantity())))
                    .reduce(BigDecimal.ZERO, BigDecimal::add);
        }

        BigDecimal totalPrice = basePrice.add(addonsTotal);

        // Create booking
        Booking booking = Booking.builder()
                .listingPublicId(dto.getListingPublicId())
                .guestPublicId(guestPublicId)
                .checkInDate(dto.getCheckInDate())
                .checkOutDate(dto.getCheckOutDate())
                .numberOfGuests(dto.getNumberOfGuests())
                .numberOfNights((int) nights)
                .totalPrice(totalPrice)
                .currency(listing.getCurrency())
                .bookingStatus(listing.getInstantBook() ? Booking.BookingStatus.CONFIRMED : Booking.BookingStatus.PENDING)
                .paymentStatus(Booking.PaymentStatus.PENDING)
                .specialRequests(dto.getSpecialRequests())
                .build();

        // Add addons
        if (dto.getAddons() != null) {
            dto.getAddons().forEach(addonDTO -> {
                BookingAddon addon = BookingAddon.builder()
                        .name(addonDTO.getName())
                        .description(addonDTO.getDescription())
                        .price(addonDTO.getPrice())
                        .quantity(addonDTO.getQuantity())
                        .build();
                booking.addAddon(addon);
            });
        }

        Booking savedBooking = bookingRepository.save(booking);
        log.info("Booking created: {}", savedBooking.getPublicId());

        return bookingMapper.toDTO(savedBooking, listing);
    }

    @Transactional(readOnly = true)
    public BookingDTO getBookingByPublicId(UUID publicId, UUID currentUserPublicId) {
        Booking booking = bookingRepository.findByPublicId(publicId)
                .orElseThrow(() -> new NotFoundException("Booking not found"));

        Listing listing = listingRepository.findByPublicId(booking.getListingPublicId())
                .orElseThrow(() -> new NotFoundException("Listing not found"));

        // Check if user has access to this booking
        if (!booking.getGuestPublicId().equals(currentUserPublicId) && 
            !listing.getLandlordPublicId().equals(currentUserPublicId)) {
            throw new ForbiddenException("You don't have access to this booking");
        }

        return bookingMapper.toDTO(booking, listing);
    }

    @Transactional(readOnly = true)
    public Page<BookingDTO> getBookingsByGuest(UUID guestPublicId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<Booking> bookings = bookingRepository.findByGuestPublicId(guestPublicId, pageable);
        
        return bookings.map(booking -> {
            Listing listing = listingRepository.findByPublicId(booking.getListingPublicId())
                    .orElse(null);
            return bookingMapper.toDTO(booking, listing);
        });
    }

    @Transactional(readOnly = true)
    public List<BookingDTO> getBookingsByListing(UUID listingPublicId, UUID currentUserPublicId) {
        Listing listing = listingRepository.findByPublicId(listingPublicId)
                .orElseThrow(() -> new NotFoundException("Listing not found"));

        if (!listing.getLandlordPublicId().equals(currentUserPublicId)) {
            throw new ForbiddenException("You don't have access to these bookings");
        }

        List<Booking> bookings = bookingRepository.findByListingPublicId(listingPublicId);
        
        return bookings.stream()
                .map(booking -> bookingMapper.toDTO(booking, listing))
                .toList();
    }

    public BookingDTO updateBookingStatus(UUID publicId, Booking.BookingStatus status, UUID currentUserPublicId) {
        Booking booking = bookingRepository.findByPublicId(publicId)
                .orElseThrow(() -> new NotFoundException("Booking not found"));

        Listing listing = listingRepository.findByPublicId(booking.getListingPublicId())
                .orElseThrow(() -> new NotFoundException("Listing not found"));

        // Only landlord can update booking status (except cancellation by guest)
        if (!listing.getLandlordPublicId().equals(currentUserPublicId) && 
            status != Booking.BookingStatus.CANCELLED) {
            throw new ForbiddenException("Only the property owner can update booking status");
        }

        // Guest can cancel their own booking
        if (status == Booking.BookingStatus.CANCELLED && 
            !booking.getGuestPublicId().equals(currentUserPublicId)) {
            throw new ForbiddenException("You can only cancel your own bookings");
        }

        booking.setBookingStatus(status);
        
        if (status == Booking.BookingStatus.CANCELLED) {
            booking.setCancelledAt(java.time.Instant.now());
        }

        Booking savedBooking = bookingRepository.save(booking);
        
        return bookingMapper.toDTO(savedBooking, listing);
    }

    public BookingDTO cancelBooking(UUID publicId, String reason, UUID currentUserPublicId) {
        Booking booking = bookingRepository.findByPublicId(publicId)
                .orElseThrow(() -> new NotFoundException("Booking not found"));

        if (!booking.getGuestPublicId().equals(currentUserPublicId)) {
            throw new ForbiddenException("You can only cancel your own bookings");
        }

        if (booking.getBookingStatus() == Booking.BookingStatus.CANCELLED) {
            throw new BadRequestException("Booking is already cancelled");
        }

        if (booking.getCheckInDate().isBefore(LocalDate.now())) {
            throw new BadRequestException("Cannot cancel past bookings");
        }

        booking.setBookingStatus(Booking.BookingStatus.CANCELLED);
        booking.setCancellationReason(reason);
        booking.setCancelledAt(java.time.Instant.now());

        Booking savedBooking = bookingRepository.save(booking);

        Listing listing = listingRepository.findByPublicId(booking.getListingPublicId()).orElse(null);
        
        return bookingMapper.toDTO(savedBooking, listing);
    }

    @Transactional(readOnly = true)
    public List<LocalDate> getUnavailableDates(UUID listingPublicId) {
        List<Booking> bookings = bookingRepository.findByListingPublicId(listingPublicId);
        
        return bookings.stream()
                .filter(b -> b.getBookingStatus() != Booking.BookingStatus.CANCELLED && 
                           b.getBookingStatus() != Booking.BookingStatus.REJECTED)
                .flatMap(b -> b.getCheckInDate().datesUntil(b.getCheckOutDate()))
                .distinct()
                .toList();
    }
}