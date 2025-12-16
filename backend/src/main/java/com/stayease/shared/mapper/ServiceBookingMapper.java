package com.stayease.shared.mapper;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Component;

import com.stayease.domain.serviceoffering.dto.ServiceBookingDTO;
import com.stayease.domain.serviceoffering.entity.ServiceBooking;
import com.stayease.domain.serviceoffering.entity.ServiceOffering;
import com.stayease.domain.serviceoffering.repository.ServiceOfferingRepository;
import com.stayease.domain.user.entity.User;
import com.stayease.domain.user.repository.UserRepository;

import lombok.RequiredArgsConstructor;

/**
 * Mapper for ServiceBooking entity and DTOs
 */
@Component
@RequiredArgsConstructor
public class ServiceBookingMapper {

    private final ServiceOfferingRepository serviceOfferingRepository;
    private final UserRepository userRepository;

    /**
     * Convert ServiceBooking entity to ServiceBookingDTO
     */
    public ServiceBookingDTO toDTO(ServiceBooking booking) {
        if (booking == null) {
            return null;
        }

        // Fetch related entities for additional information
        ServiceOffering service = serviceOfferingRepository
                .findByPublicId(booking.getServicePublicId())
                .orElse(null);

        User customer = null;
        try {
            customer = userRepository
                .findByPublicId(java.util.UUID.fromString(booking.getCustomerPublicId()))
                .orElse(null);
        } catch (Exception e) {
            // Invalid UUID, leave customer as null
        }

        User provider = null;
        try {
            provider = userRepository
                .findByPublicId(java.util.UUID.fromString(booking.getProviderPublicId()))
                .orElse(null);
        } catch (Exception e) {
            // Invalid UUID, leave provider as null
        }

        ServiceBookingDTO dto = ServiceBookingDTO.builder()
                .publicId(booking.getPublicId())
                .status(booking.getStatus())
                .paymentStatus(booking.getPaymentStatus())
                
                // Service info
                .servicePublicId(booking.getServicePublicId())
                .serviceTitle(service != null ? service.getTitle() : null)
                .serviceCategory(service != null ? service.getCategory().name() : null)
                .serviceImageUrl(service != null && !service.getImages().isEmpty() 
                    ? service.getImages().stream()
                        .filter(img -> img.getIsPrimary())
                        .findFirst()
                        .map(img -> img.getImageUrl())
                        .orElse(service.getImages().get(0).getImageUrl())
                    : null)
                
                // Customer info
                .customerPublicId(booking.getCustomerPublicId())
                .customerName(customer != null ? customer.getFirstName() + " " + customer.getLastName() : null)
                .customerAvatarUrl(customer != null && customer.getProfileImageUrl() != null ? customer.getProfileImageUrl() : null)
                .customerPhone(booking.getCustomerPhone())
                .customerEmail(booking.getCustomerEmail())
                
                // Provider info
                .providerPublicId(booking.getProviderPublicId())
                .providerName(provider != null ? provider.getFirstName() + " " + provider.getLastName() : null)
                .providerAvatarUrl(provider != null && provider.getProfileImageUrl() != null ? provider.getProfileImageUrl() : null)
                
                // Booking details
                .bookingDate(booking.getBookingDate())
                .startTime(booking.getStartTime())
                .endTime(booking.getEndTime())
                .durationMinutes(booking.getDurationMinutes())
                .numberOfPeople(booking.getNumberOfPeople())
                .numberOfItems(booking.getNumberOfItems())
                
                // Location
                .serviceLocation(service != null ? service.getAddress() : null)
                .customerAddress(booking.getCustomerAddress())
                
                // Pricing
                .basePrice(booking.getBasePrice())
                .extraPersonCharge(booking.getExtraPersonCharge())
                .surcharges(booking.getSurcharges())
                .discount(booking.getDiscount())
                .serviceFee(booking.getServiceFee())
                .tax(booking.getTax())
                .totalPrice(booking.getTotalPrice())
                
                // Customer details
                .specialRequests(booking.getSpecialRequests())
                
                // Status timestamps
                .confirmedAt(booking.getConfirmedAt())
                .rejectedAt(booking.getRejectedAt())
                .rejectionReason(booking.getRejectionReason())
                .cancelledAt(booking.getCancelledAt())
                .cancellationReason(booking.getCancellationReason())
                .paidAt(booking.getPaidAt())
                .serviceStartedAt(booking.getServiceStartedAt())
                .serviceCompletedAt(booking.getServiceCompletedAt())
                
                // Refund
                .isRefundable(booking.getIsRefundable())
                .refundAmount(booking.getRefundAmount())
                .refundedAt(booking.getRefundedAt())
                
                // Review
                .isReviewedByCustomer(booking.getIsReviewedByCustomer())
                .isReviewedByProvider(booking.getIsReviewedByProvider())
                
                // Timestamps
                .createdAt(booking.getCreatedAt())
                .updatedAt(booking.getUpdatedAt())
                
                // Computed fields
                .canCancel(booking.canCancel())
                .canReview(booking.canReview())
                .statusDisplay(getStatusDisplay(booking.getStatus()))
                
                .build();

        return dto;
    }

    /**
     * Convert list of ServiceBooking entities to list of ServiceBookingDTOs
     */
    public List<ServiceBookingDTO> toDTOList(List<ServiceBooking> bookings) {
        if (bookings == null) {
            return null;
        }

        return bookings.stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    /**
     * Get human-readable status display
     */
    private String getStatusDisplay(ServiceBooking.BookingStatus status) {
        if (status == null) {
            return null;
        }

        switch (status) {
            case PENDING:
                return "Pending Confirmation";
            case CONFIRMED:
                return "Confirmed";
            case PAID:
                return "Payment Completed";
            case IN_PROGRESS:
                return "Service In Progress";
            case COMPLETED:
                return "Completed";
            case CANCELLED:
                return "Cancelled";
            case REJECTED:
                return "Rejected";
            case REFUNDED:
                return "Refunded";
            case NO_SHOW:
                return "No Show";
            default:
                return status.name();
        }
    }

    /**
     * Minimal DTO mapping for list views (optimized performance)
     * Only fetches essential information without loading all relationships
     */
    public ServiceBookingDTO toMinimalDTO(ServiceBooking booking) {
        if (booking == null) {
            return null;
        }

        return ServiceBookingDTO.builder()
                .publicId(booking.getPublicId())
                .status(booking.getStatus())
                .paymentStatus(booking.getPaymentStatus())
                .servicePublicId(booking.getServicePublicId())
                .customerPublicId(booking.getCustomerPublicId())
                .providerPublicId(booking.getProviderPublicId())
                .bookingDate(booking.getBookingDate())
                .startTime(booking.getStartTime())
                .endTime(booking.getEndTime())
                .totalPrice(booking.getTotalPrice())
                .createdAt(booking.getCreatedAt())
                .canCancel(booking.canCancel())
                .canReview(booking.canReview())
                .statusDisplay(getStatusDisplay(booking.getStatus()))
                .build();
    }

    /**
     * Convert list to minimal DTOs for better performance in list views
     */
    public List<ServiceBookingDTO> toMinimalDTOList(List<ServiceBooking> bookings) {
        if (bookings == null) {
            return null;
        }

        return bookings.stream()
                .map(this::toMinimalDTO)
                .collect(Collectors.toList());
    }
}