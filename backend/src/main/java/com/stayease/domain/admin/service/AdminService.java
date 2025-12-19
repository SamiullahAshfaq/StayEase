package com.stayease.domain.admin.service;

import java.time.Instant;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.stayease.domain.admin.dto.AdminActionDTO;
import com.stayease.domain.admin.dto.BookingManagementDTO;
import com.stayease.domain.admin.dto.ListingManagementDTO;
import com.stayease.domain.admin.entity.AdminAction;
import com.stayease.domain.admin.repository.AdminActionRepository;
import com.stayease.domain.booking.entity.Booking;
import com.stayease.domain.booking.repository.BookingRepository;
import com.stayease.domain.listing.entity.Listing;
import com.stayease.domain.listing.repository.ListingRepository;
import com.stayease.domain.user.entity.User;
import com.stayease.domain.user.repository.UserRepository;
import com.stayease.exception.NotFoundException;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class AdminService {

    private final AdminActionRepository adminActionRepository;
    private final UserRepository userRepository;
    private final ListingRepository listingRepository;
    private final BookingRepository bookingRepository;
    private final AuditService auditService;

    /**
     * Approve a listing
     */
    public void approveListing(UUID adminPublicId, UUID listingPublicId, String reason) {
        log.info("Admin {} approving listing {}", adminPublicId, listingPublicId);

        Listing listing = listingRepository.findByPublicId(listingPublicId)
                .orElseThrow(() -> new NotFoundException("Listing not found"));

        listing.setStatus(Listing.ListingStatus.ACTIVE);
        listingRepository.save(listing);

        // Record admin action
        recordAdminAction(adminPublicId, "APPROVE_LISTING", "Listing", listingPublicId.toString(), reason);

        // Audit log
        auditService.logAction(adminPublicId, "APPROVE_LISTING",
                "Listing: " + listingPublicId,
                "Listing approved. Reason: " + reason);
    }

    /**
     * Reject a listing
     */
    public void rejectListing(UUID adminPublicId, UUID listingPublicId, String reason) {
        log.info("Admin {} rejecting listing {}", adminPublicId, listingPublicId);

        Listing listing = listingRepository.findByPublicId(listingPublicId)
                .orElseThrow(() -> new NotFoundException("Listing not found"));

        listing.setStatus(Listing.ListingStatus.SUSPENDED);
        listingRepository.save(listing);

        recordAdminAction(adminPublicId, "REJECT_LISTING", "Listing", listingPublicId.toString(), reason);
        auditService.logAction(adminPublicId, "REJECT_LISTING",
                "Listing: " + listingPublicId,
                "Listing rejected. Reason: " + reason);
    }

    /**
     * Suspend a user account
     */
    public void suspendUser(UUID adminPublicId, UUID userPublicId, String reason) {
        log.info("Admin {} suspending user {}", adminPublicId, userPublicId);

        User user = userRepository.findByPublicId(userPublicId)
                .orElseThrow(() -> new NotFoundException("User not found"));

        user.setIsActive(false);
        userRepository.save(user);

        recordAdminAction(adminPublicId, "SUSPEND_USER", "User", userPublicId.toString(), reason);
        auditService.logAction(adminPublicId, "SUSPEND_USER",
                "User: " + user.getEmail(),
                "User suspended. Reason: " + reason);
    }

    /**
     * Reactivate a suspended user account
     */
    public void reactivateUser(UUID adminPublicId, UUID userPublicId, String reason) {
        log.info("Admin {} reactivating user {}", adminPublicId, userPublicId);

        User user = userRepository.findByPublicId(userPublicId)
                .orElseThrow(() -> new NotFoundException("User not found"));

        user.setIsActive(true);
        userRepository.save(user);

        recordAdminAction(adminPublicId, "REACTIVATE_USER", "User", userPublicId.toString(), reason);
        auditService.logAction(adminPublicId, "REACTIVATE_USER",
                "User: " + user.getEmail(),
                "User reactivated. Reason: " + reason);
    }

    /**
     * Cancel a booking as admin
     */
    public void cancelBooking(UUID adminPublicId, UUID bookingPublicId, String reason) {
        log.info("Admin {} cancelling booking {}", adminPublicId, bookingPublicId);

        Booking booking = bookingRepository.findByPublicId(bookingPublicId)
                .orElseThrow(() -> new NotFoundException("Booking not found"));

        booking.setBookingStatus(Booking.BookingStatus.CANCELLED);
        booking.setCancellationReason(reason);
        booking.setCancelledAt(Instant.now());
        bookingRepository.save(booking);

        recordAdminAction(adminPublicId, "CANCEL_BOOKING", "Booking", bookingPublicId.toString(), reason);
        auditService.logAction(adminPublicId, "CANCEL_BOOKING",
                "Booking: " + bookingPublicId,
                "Booking cancelled by admin. Reason: " + reason);
    }

    /**
     * Feature a listing
     */
    public void featureListing(UUID adminPublicId, UUID listingPublicId, String reason) {
        log.info("Admin {} featuring listing {}", adminPublicId, listingPublicId);

        Listing listing = listingRepository.findByPublicId(listingPublicId)
                .orElseThrow(() -> new NotFoundException("Listing not found"));

        listing.setInstantBook(true);
        listingRepository.save(listing);

        recordAdminAction(adminPublicId, "FEATURE_LISTING", "Listing", listingPublicId.toString(), reason);
        auditService.logAction(adminPublicId, "FEATURE_LISTING",
                "Listing: " + listingPublicId,
                "Listing featured. Reason: " + reason);
    }

    /**
     * Unfeature a listing
     */
    public void unfeatureListing(UUID adminPublicId, UUID listingPublicId, String reason) {
        log.info("Admin {} unfeaturing listing {}", adminPublicId, listingPublicId);

        Listing listing = listingRepository.findByPublicId(listingPublicId)
                .orElseThrow(() -> new NotFoundException("Listing not found"));

        listing.setInstantBook(false);
        listingRepository.save(listing);

        recordAdminAction(adminPublicId, "UNFEATURE_LISTING", "Listing", listingPublicId.toString(), reason);
        auditService.logAction(adminPublicId, "UNFEATURE_LISTING",
                "Listing: " + listingPublicId,
                "Listing unfeatured. Reason: " + reason);
    }

    /**
     * Get all admin actions with pagination
     */
    @Transactional(readOnly = true)
    public Page<AdminActionDTO> getAllAdminActions(Pageable pageable) {
        log.info("Fetching all admin actions with pagination");
        return adminActionRepository.findAll(pageable).map(this::convertToDTO);
    }

    /**
     * Get admin actions by admin
     */
    @Transactional(readOnly = true)
    public Page<AdminActionDTO> getAdminActionsByAdmin(UUID adminPublicId, Pageable pageable) {
        log.info("Fetching admin actions for admin: {}", adminPublicId);
        return adminActionRepository.findByAdminPublicId(adminPublicId, pageable).map(this::convertToDTO);
    }

    /**
     * Get admin actions by type
     */
    @Transactional(readOnly = true)
    public Page<AdminActionDTO> getAdminActionsByType(String actionType, Pageable pageable) {
        log.info("Fetching admin actions of type: {}", actionType);
        return adminActionRepository.findByActionType(actionType, pageable).map(this::convertToDTO);
    }

    /**
     * Get admin actions for a specific target
     */
    @Transactional(readOnly = true)
    public List<AdminActionDTO> getAdminActionsForTarget(String targetEntity, String targetId) {
        log.info("Fetching admin actions for target: {} {}", targetEntity, targetId);
        return adminActionRepository.findByTargetEntityAndId(targetEntity, targetId)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Get admin actions within date range
     */
    @Transactional(readOnly = true)
    public List<AdminActionDTO> getAdminActionsByDateRange(Instant startDate, Instant endDate) {
        log.info("Fetching admin actions between {} and {}", startDate, endDate);
        return adminActionRepository.findByDateRange(startDate, endDate)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Get all bookings for admin management with pagination and filters
     */
    @Transactional(readOnly = true)
    public Page<BookingManagementDTO> getAllBookings(Pageable pageable, String status, String search) {
        log.info("Fetching all bookings for admin management with filters - status: {}, search: {}", status, search);

        // For now, use basic findAll - can be enhanced with custom repository methods later
        Page<Booking> bookings = bookingRepository.findAll(pageable);
        return bookings.map(this::convertBookingToDTO);
    }

    /**
     * Get all listings for admin management with pagination and filters
     */
    @Transactional(readOnly = true)
    public Page<ListingManagementDTO> getAllListings(Pageable pageable, String status, String search) {
        log.info("Fetching all listings for admin management with filters - status: {}, search: {}", status, search);

        // For now, use basic findAll - can be enhanced with custom repository methods later
        Page<Listing> listings = listingRepository.findAll(pageable);
        return listings.map(this::convertListingToDTO);
    }

    /**
     * Record an admin action
     */
    private void recordAdminAction(UUID adminPublicId, String actionType,
            String targetEntity, String targetId, String reason) {
        AdminAction action = AdminAction.builder()
                .adminPublicId(adminPublicId)
                .actionType(actionType)
                .targetEntity(targetEntity)
                .targetId(targetId)
                .reason(reason)
                .build();

        adminActionRepository.save(action);
    }

    /**
     * Convert AdminAction entity to DTO
     */
    private AdminActionDTO convertToDTO(AdminAction action) {
        AdminActionDTO dto = AdminActionDTO.builder()
                .id(action.getId())
                .adminPublicId(action.getAdminPublicId())
                .actionType(action.getActionType())
                .targetEntity(action.getTargetEntity())
                .targetId(action.getTargetId())
                .reason(action.getReason())
                .createdAt(action.getCreatedAt())
                .build();

        // Fetch admin details
        userRepository.findByPublicId(action.getAdminPublicId()).ifPresent(user -> {
            dto.setAdminEmail(user.getEmail());
            dto.setAdminName(user.getFirstName() + " " + user.getLastName());
        });

        return dto;
    }

    /**
     * Convert Booking entity to BookingManagementDTO
     */
    private BookingManagementDTO convertBookingToDTO(Booking booking) {
        // Fetch related entities
        Listing listing = listingRepository.findByPublicId(booking.getListingPublicId()).orElse(null);
        User guest = userRepository.findByPublicId(booking.getGuestPublicId()).orElse(null);
        User landlord = listing != null ? userRepository.findByPublicId(listing.getLandlordPublicId()).orElse(null) : null;

        return BookingManagementDTO.builder()
                .publicId(booking.getPublicId())
                .listingTitle(listing != null ? listing.getTitle() : "Unknown Listing")
                .listingLocation(listing != null ? listing.getLocation() : "Unknown Location")
                .guestName(guest != null ? guest.getFirstName() + " " + guest.getLastName() : "Unknown Guest")
                .guestEmail(guest != null ? guest.getEmail() : "Unknown Email")
                .landlordName(landlord != null ? landlord.getFirstName() + " " + landlord.getLastName() : "Unknown Landlord")
                .landlordEmail(landlord != null ? landlord.getEmail() : "Unknown Email")
                .checkInDate(booking.getCheckInDate())
                .checkOutDate(booking.getCheckOutDate())
                .numberOfGuests(booking.getNumberOfGuests())
                .totalPrice(booking.getTotalPrice())
                .currency(booking.getCurrency())
                .bookingStatus(booking.getBookingStatus().name())
                .paymentStatus(booking.getPaymentStatus().name())
                .createdAt(booking.getCreatedAt())
                .updatedAt(booking.getUpdatedAt())
                .build();
    }

    /**
     * Convert Listing entity to ListingManagementDTO
     */
    private ListingManagementDTO convertListingToDTO(Listing listing) {
        // Fetch landlord details
        User landlord = userRepository.findByPublicId(listing.getLandlordPublicId()).orElse(null);

        return ListingManagementDTO.builder()
                .publicId(listing.getPublicId())
                .title(listing.getTitle())
                .location(listing.getLocation())
                .city(listing.getCity())
                .country(listing.getCountry())
                .landlordName(landlord != null ? landlord.getFirstName() + " " + landlord.getLastName() : "Unknown Landlord")
                .landlordEmail(landlord != null ? landlord.getEmail() : "Unknown Email")
                .pricePerNight(listing.getPricePerNight())
                .currency(listing.getCurrency())
                .maxGuests(listing.getMaxGuests())
                .propertyType(listing.getPropertyType())
                .category(listing.getCategory())
                .status(listing.getStatus().name())
                .instantBook(listing.getInstantBook())
                .createdAt(listing.getCreatedAt())
                .updatedAt(listing.getUpdatedAt())
                .build();
    }
}
