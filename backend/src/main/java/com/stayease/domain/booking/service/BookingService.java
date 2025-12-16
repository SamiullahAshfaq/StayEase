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

        try {
            // Validate input
            if (dto == null || dto.getListingPublicId() == null || guestPublicId == null) {
                throw new BadRequestException("Invalid booking data");
            }

            // Validate dates
            if (dto.getCheckInDate() == null || dto.getCheckOutDate() == null) {
                throw new BadRequestException("Check-in and check-out dates are required");
            }

            if (dto.getCheckOutDate().isBefore(dto.getCheckInDate()) ||
                    dto.getCheckOutDate().isEqual(dto.getCheckInDate())) {
                throw new BadRequestException("Check-out date must be after check-in date");
            }

            // Get listing
            Listing listing = listingRepository.findByPublicId(dto.getListingPublicId())
                    .orElseThrow(() -> new NotFoundException("Listing not found"));

            // Check if guest is trying to book their own listing
            if (listing.getLandlordPublicId() != null && listing.getLandlordPublicId().equals(guestPublicId)) {
                throw new BadRequestException("You cannot book your own listing");
            }

            // Validate guest count
            if (dto.getNumberOfGuests() == null || dto.getNumberOfGuests() <= 0) {
                throw new BadRequestException("Number of guests must be at least 1");
            }

            if (listing.getMaxGuests() != null && dto.getNumberOfGuests() > listing.getMaxGuests()) {
                throw new BadRequestException("Number of guests exceeds maximum capacity");
            }

            // Check for conflicting bookings
            List<Booking> conflicts = bookingRepository.findConflictingBookings(
                    dto.getListingPublicId(),
                    dto.getCheckInDate(),
                    dto.getCheckOutDate());

            if (!conflicts.isEmpty()) {
                throw new BadRequestException("Listing is not available for selected dates");
            }

            // Calculate nights and total price
            long nights = ChronoUnit.DAYS.between(dto.getCheckInDate(), dto.getCheckOutDate());
            BigDecimal pricePerNight = listing.getPricePerNight() != null ? listing.getPricePerNight()
                    : BigDecimal.ZERO;
            BigDecimal basePrice = pricePerNight.multiply(BigDecimal.valueOf(nights));

            BigDecimal addonsTotal = BigDecimal.ZERO;
            if (dto.getAddons() != null) {
                addonsTotal = dto.getAddons().stream()
                        .filter(addon -> addon != null && addon.getPrice() != null)
                        .map(addon -> addon.getPrice()
                                .multiply(BigDecimal.valueOf(addon.getQuantity() != null ? addon.getQuantity() : 1)))
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
                    .currency(listing.getCurrency() != null ? listing.getCurrency() : "USD")
                    .bookingStatus(
                            Boolean.TRUE.equals(listing.getInstantBook()) ? Booking.BookingStatus.CONFIRMED
                                    : Booking.BookingStatus.PENDING)
                    .paymentStatus(Booking.PaymentStatus.PENDING)
                    .specialRequests(dto.getSpecialRequests())
                    .build();

            // Add addons
            if (dto.getAddons() != null) {
                dto.getAddons().stream()
                        .filter(addonDTO -> addonDTO != null)
                        .forEach(addonDTO -> {
                            BookingAddon addon = BookingAddon.builder()
                                    .name(addonDTO.getName())
                                    .description(addonDTO.getDescription())
                                    .price(addonDTO.getPrice())
                                    .quantity(addonDTO.getQuantity() != null ? addonDTO.getQuantity() : 1)
                                    .build();
                            booking.addAddon(addon);
                        });
            }

            Booking savedBooking = bookingRepository.save(booking);
            log.info("Booking created: {}", savedBooking.getPublicId());

            return bookingMapper.toDTO(savedBooking, listing);
        } catch (BadRequestException | NotFoundException | ForbiddenException e) {
            log.error("Business logic error creating booking: {}", e.getMessage());
            throw e;
        } catch (Exception e) {
            log.error("Unexpected error creating booking for listing: {} by guest: {}", dto.getListingPublicId(),
                    guestPublicId, e);
            throw new RuntimeException("Failed to create booking: " + e.getMessage(), e);
        }
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
        log.debug("Fetching bookings for guest: {} (page: {}, size: {})", guestPublicId, page, size);

        try {
            Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
            Page<Booking> bookings = bookingRepository.findByGuestPublicId(guestPublicId, pageable);

            log.debug("Found {} bookings for guest: {}", bookings.getTotalElements(), guestPublicId);

            return bookings.map(booking -> {
                try {
                    Listing listing = listingRepository.findByPublicId(booking.getListingPublicId())
                            .orElse(null);
                    return bookingMapper.toDTO(booking, listing);
                } catch (Exception e) {
                    log.error("Error mapping booking to DTO: {}", booking.getPublicId(), e);
                    throw new RuntimeException("Error mapping booking to DTO", e);
                }
            });
        } catch (Exception e) {
            log.error("Error fetching bookings for guest: {}", guestPublicId, e);
            // Return empty page instead of throwing exception
            return Page.empty(PageRequest.of(page, size));
        }
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

    public BookingDTO updateBooking(UUID publicId, UpdateBookingDTO dto, UUID currentUserPublicId) {
        log.info("Updating booking: {}", publicId);

        Booking booking = bookingRepository.findByPublicId(publicId)
                .orElseThrow(() -> new NotFoundException("Booking not found"));

        // Verify ownership
        if (!booking.getGuestPublicId().equals(currentUserPublicId)) {
            throw new ForbiddenException("You can only update your own bookings");
        }

        // Can only update confirmed or pending bookings
        if (booking.getBookingStatus() != Booking.BookingStatus.CONFIRMED &&
                booking.getBookingStatus() != Booking.BookingStatus.PENDING) {
            throw new BadRequestException("Cannot update booking with status: " + booking.getBookingStatus());
        }

        // Validate dates
        if (dto.getCheckInDate().isBefore(LocalDate.now())) {
            throw new BadRequestException("Check-in date must be in the future");
        }

        if (dto.getCheckOutDate().isBefore(dto.getCheckInDate()) ||
                dto.getCheckOutDate().isEqual(dto.getCheckInDate())) {
            throw new BadRequestException("Check-out date must be after check-in date");
        }

        // Check listing still exists
        Listing listing = listingRepository.findByPublicId(booking.getListingPublicId())
                .orElseThrow(() -> new NotFoundException("Listing not found"));

        // Validate guest count
        if (dto.getNumberOfGuests() > listing.getMaxGuests()) {
            throw new BadRequestException("Number of guests exceeds listing capacity");
        }

        // Update booking fields
        booking.setCheckInDate(dto.getCheckInDate());
        booking.setCheckOutDate(dto.getCheckOutDate());
        booking.setNumberOfGuests(dto.getNumberOfGuests());

        if (dto.getSpecialRequests() != null) {
            booking.setSpecialRequests(dto.getSpecialRequests());
        }

        // Recalculate number of nights
        long nights = ChronoUnit.DAYS.between(dto.getCheckInDate(), dto.getCheckOutDate());
        booking.setNumberOfNights((int) nights);

        // Recalculate total price
        BigDecimal nightlyPrice = listing.getPricePerNight();
        BigDecimal accommodationTotal = nightlyPrice.multiply(new BigDecimal(nights));

        // Handle addons - clear old ones and add new ones
        booking.getAddons().clear(); // Clear existing addons (orphan removal will delete them)

        BigDecimal addonsTotal = BigDecimal.ZERO;
        if (dto.getAddons() != null && !dto.getAddons().isEmpty()) {
            for (BookingAddonDTO addonDTO : dto.getAddons()) {
                BookingAddon addon = new BookingAddon();
                addon.setName(addonDTO.getName());
                addon.setPrice(addonDTO.getPrice());
                addon.setQuantity(addonDTO.getQuantity() != null ? addonDTO.getQuantity() : 1);
                addon.setDescription(addonDTO.getDescription());

                // Use the helper method to properly set the relationship
                booking.addAddon(addon);

                // Calculate addon cost
                addonsTotal = addonsTotal.add(
                        addon.getPrice().multiply(new BigDecimal(addon.getQuantity())));
            }
        }

        BigDecimal subtotal = accommodationTotal.add(addonsTotal);
        BigDecimal serviceFee = subtotal.multiply(new BigDecimal("0.10")); // 10% service fee
        BigDecimal totalPrice = subtotal.add(serviceFee);

        booking.setTotalPrice(totalPrice);

        Booking savedBooking = bookingRepository.save(booking);
        log.info("Booking updated successfully: {}", publicId);

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
        try {
            if (listingPublicId == null) {
                log.warn("Null listingPublicId provided to getUnavailableDates");
                return List.of();
            }

            List<Booking> bookings = bookingRepository.findByListingPublicId(listingPublicId);

            if (bookings == null || bookings.isEmpty()) {
                return List.of();
            }

            return bookings.stream()
                    .filter(b -> b != null &&
                            b.getBookingStatus() != null &&
                            b.getBookingStatus() != Booking.BookingStatus.CANCELLED &&
                            b.getBookingStatus() != Booking.BookingStatus.REJECTED &&
                            b.getCheckInDate() != null &&
                            b.getCheckOutDate() != null)
                    .flatMap(b -> {
                        try {
                            return b.getCheckInDate().datesUntil(b.getCheckOutDate());
                        } catch (Exception e) {
                            log.error("Error generating dates for booking: {}", b.getPublicId(), e);
                            return java.util.stream.Stream.empty();
                        }
                    })
                    .distinct()
                    .toList();
        } catch (Exception e) {
            log.error("Error fetching unavailable dates for listing: {}", listingPublicId, e);
            return List.of();
        }
    }

    @Transactional
    public BookingDTO confirmPayment(UUID bookingPublicId, UUID guestPublicId) {
        log.info("Confirming payment for booking: {}", bookingPublicId);

        try {
            if (bookingPublicId == null || guestPublicId == null) {
                throw new BadRequestException("Invalid booking or user ID");
            }

            Booking booking = bookingRepository.findByPublicId(bookingPublicId)
                    .orElseThrow(() -> new NotFoundException("Booking not found"));

            // Verify ownership
            if (booking.getGuestPublicId() == null || !booking.getGuestPublicId().equals(guestPublicId)) {
                throw new ForbiddenException("You don't have permission to confirm this booking");
            }

            // Check if already confirmed
            if (booking.getPaymentStatus() == Booking.PaymentStatus.PAID) {
                log.info("Payment already confirmed for booking: {}", bookingPublicId);
                // Return current state instead of throwing error
                Listing listing = listingRepository.findByPublicId(booking.getListingPublicId()).orElse(null);
                return bookingMapper.toDTO(booking, listing);
            }

            // Update payment and booking status
            booking.setPaymentStatus(Booking.PaymentStatus.PAID);
            booking.setBookingStatus(Booking.BookingStatus.CONFIRMED);

            Booking savedBooking = bookingRepository.save(booking);
            log.info("Payment confirmed successfully for booking: {}", bookingPublicId);

            Listing listing = listingRepository.findByPublicId(booking.getListingPublicId()).orElse(null);

            return bookingMapper.toDTO(savedBooking, listing);
        } catch (BadRequestException | NotFoundException | ForbiddenException e) {
            log.error("Business logic error confirming payment: {}", e.getMessage());
            throw e;
        } catch (Exception e) {
            log.error("Unexpected error confirming payment for booking: {}", bookingPublicId, e);
            throw new RuntimeException("Failed to confirm payment: " + e.getMessage(), e);
        }
    }
}