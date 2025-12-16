package com.stayease.domain.serviceoffering.controller;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.stayease.domain.serviceoffering.dto.CreateServiceBookingDTO;
import com.stayease.domain.serviceoffering.dto.ServiceBookingDTO;
import com.stayease.domain.serviceoffering.entity.ServiceBooking.BookingStatus;
import com.stayease.domain.serviceoffering.service.ServiceBookingService;
import com.stayease.security.UserPrincipal;
import com.stayease.shared.dto.ApiResponse;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * REST Controller for Service Booking management
 */
@RestController
@RequestMapping("/api/service-bookings")
@RequiredArgsConstructor
@Slf4j
public class ServiceBookingController {

    private final ServiceBookingService serviceBookingService;

    /**
     * Create a new service booking
     */
    @PostMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<ServiceBookingDTO>> createBooking(
            @Valid @RequestBody CreateServiceBookingDTO dto,
            @AuthenticationPrincipal UserPrincipal currentUser) {

        log.info("Creating service booking for user: {}", currentUser.getId());

        String customerPublicId = currentUser.getId().toString();
        ServiceBookingDTO createdBooking = serviceBookingService.createBooking(dto, customerPublicId);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.<ServiceBookingDTO>builder()
                        .success(true)
                        .message("Service booking created successfully")
                        .data(createdBooking)
                        .build());
    }

    /**
     * Get booking by public ID
     */
    @GetMapping("/{publicId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<ServiceBookingDTO>> getBookingById(
            @PathVariable String publicId,
            @AuthenticationPrincipal UserPrincipal currentUser) {

        log.debug("Fetching booking: {}", publicId);

        String userPublicId = currentUser.getId().toString();
        ServiceBookingDTO booking = serviceBookingService.getBookingByPublicId(publicId, userPublicId);

        return ResponseEntity.ok(ApiResponse.<ServiceBookingDTO>builder()
                .success(true)
                .data(booking)
                .build());
    }

    /**
     * Get all bookings for current customer
     */
    @GetMapping("/my-bookings")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<Page<ServiceBookingDTO>>> getMyBookings(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @AuthenticationPrincipal UserPrincipal currentUser) {

        log.debug("Fetching bookings for customer: {}", currentUser.getId());

        String customerPublicId = currentUser.getId().toString();
        Page<ServiceBookingDTO> bookings = serviceBookingService.getCustomerBookings(customerPublicId, page, size);

        return ResponseEntity.ok(ApiResponse.<Page<ServiceBookingDTO>>builder()
                .success(true)
                .data(bookings)
                .build());
    }

    /**
     * Get upcoming bookings for current customer
     */
    @GetMapping("/my-bookings/upcoming")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<List<ServiceBookingDTO>>> getMyUpcomingBookings(
            @AuthenticationPrincipal UserPrincipal currentUser) {

        log.debug("Fetching upcoming bookings for customer: {}", currentUser.getId());

        String customerPublicId = currentUser.getId().toString();
        List<ServiceBookingDTO> bookings = serviceBookingService.getUpcomingBookings(customerPublicId);

        return ResponseEntity.ok(ApiResponse.<List<ServiceBookingDTO>>builder()
                .success(true)
                .data(bookings)
                .build());
    }

    /**
     * Get past bookings for current customer
     */
    @GetMapping("/my-bookings/past")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<Page<ServiceBookingDTO>>> getMyPastBookings(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @AuthenticationPrincipal UserPrincipal currentUser) {

        log.debug("Fetching past bookings for customer: {}", currentUser.getId());

        String customerPublicId = currentUser.getId().toString();
        Page<ServiceBookingDTO> bookings = serviceBookingService.getPastBookings(customerPublicId, page, size);

        return ResponseEntity.ok(ApiResponse.<Page<ServiceBookingDTO>>builder()
                .success(true)
                .data(bookings)
                .build());
    }

    /**
     * Get bookings by status for current customer
     */
    @GetMapping("/my-bookings/status/{status}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<List<ServiceBookingDTO>>> getMyBookingsByStatus(
            @PathVariable BookingStatus status,
            @AuthenticationPrincipal UserPrincipal currentUser) {

        log.debug("Fetching bookings with status {} for customer: {}", status, currentUser.getId());

        String customerPublicId = currentUser.getId().toString();
        List<ServiceBookingDTO> bookings = serviceBookingService.getCustomerBookingsByStatus(customerPublicId, status);

        return ResponseEntity.ok(ApiResponse.<List<ServiceBookingDTO>>builder()
                .success(true)
                .data(bookings)
                .build());
    }

    /**
     * Get all bookings for provider (service provider's bookings)
     */
    @GetMapping("/provider-bookings")
    @PreAuthorize("hasAnyAuthority('ROLE_SERVICE_PROVIDER', 'ROLE_ADMIN')")
    public ResponseEntity<ApiResponse<Page<ServiceBookingDTO>>> getProviderBookings(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @AuthenticationPrincipal UserPrincipal currentUser) {

        log.debug("Fetching bookings for provider: {}", currentUser.getId());

        String providerPublicId = currentUser.getId().toString();
        Page<ServiceBookingDTO> bookings = serviceBookingService.getProviderBookings(providerPublicId, page, size);

        return ResponseEntity.ok(ApiResponse.<Page<ServiceBookingDTO>>builder()
                .success(true)
                .data(bookings)
                .build());
    }

    /**
     * Get bookings by status for provider
     */
    @GetMapping("/provider-bookings/status/{status}")
    @PreAuthorize("hasAnyAuthority('ROLE_SERVICE_PROVIDER', 'ROLE_ADMIN')")
    public ResponseEntity<ApiResponse<List<ServiceBookingDTO>>> getProviderBookingsByStatus(
            @PathVariable BookingStatus status,
            @AuthenticationPrincipal UserPrincipal currentUser) {

        log.debug("Fetching bookings with status {} for provider: {}", status, currentUser.getId());

        String providerPublicId = currentUser.getId().toString();
        List<ServiceBookingDTO> bookings = serviceBookingService.getProviderBookingsByStatus(providerPublicId, status);

        return ResponseEntity.ok(ApiResponse.<List<ServiceBookingDTO>>builder()
                .success(true)
                .data(bookings)
                .build());
    }

    /**
     * Get bookings for a specific service
     */
    @GetMapping("/service/{servicePublicId}")
    @PreAuthorize("hasAnyAuthority('ROLE_SERVICE_PROVIDER', 'ROLE_ADMIN')")
    public ResponseEntity<ApiResponse<Page<ServiceBookingDTO>>> getServiceBookings(
            @PathVariable String servicePublicId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @AuthenticationPrincipal UserPrincipal currentUser) {

        log.debug("Fetching bookings for service: {}", servicePublicId);

        String providerPublicId = currentUser.getId().toString();
        Page<ServiceBookingDTO> bookings = serviceBookingService.getServiceBookings(servicePublicId, providerPublicId, page, size);

        return ResponseEntity.ok(ApiResponse.<Page<ServiceBookingDTO>>builder()
                .success(true)
                .data(bookings)
                .build());
    }

    /**
     * Confirm booking (provider action)
     */
    @PostMapping("/{publicId}/confirm")
    @PreAuthorize("hasAnyAuthority('ROLE_SERVICE_PROVIDER', 'ROLE_ADMIN')")
    public ResponseEntity<ApiResponse<ServiceBookingDTO>> confirmBooking(
            @PathVariable String publicId,
            @AuthenticationPrincipal UserPrincipal currentUser) {

        log.info("Provider confirming booking: {}", publicId);

        String providerPublicId = currentUser.getId().toString();
        ServiceBookingDTO confirmedBooking = serviceBookingService.confirmBooking(publicId, providerPublicId);

        return ResponseEntity.ok(ApiResponse.<ServiceBookingDTO>builder()
                .success(true)
                .message("Booking confirmed successfully")
                .data(confirmedBooking)
                .build());
    }

    /**
     * Reject booking (provider action)
     */
    @PostMapping("/{publicId}/reject")
    @PreAuthorize("hasAnyAuthority('ROLE_SERVICE_PROVIDER', 'ROLE_ADMIN')")
    public ResponseEntity<ApiResponse<ServiceBookingDTO>> rejectBooking(
            @PathVariable String publicId,
            @RequestParam String reason,
            @AuthenticationPrincipal UserPrincipal currentUser) {

        log.info("Provider rejecting booking: {}", publicId);

        String providerPublicId = currentUser.getId().toString();
        ServiceBookingDTO rejectedBooking = serviceBookingService.rejectBooking(publicId, reason, providerPublicId);

        return ResponseEntity.ok(ApiResponse.<ServiceBookingDTO>builder()
                .success(true)
                .message("Booking rejected")
                .data(rejectedBooking)
                .build());
    }

    /**
     * Cancel booking (customer action)
     */
    @PostMapping("/{publicId}/cancel")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<ServiceBookingDTO>> cancelBooking(
            @PathVariable String publicId,
            @RequestParam(required = false) String reason,
            @AuthenticationPrincipal UserPrincipal currentUser) {

        log.info("Customer cancelling booking: {}", publicId);

        String customerPublicId = currentUser.getId().toString();
        ServiceBookingDTO cancelledBooking = serviceBookingService.cancelBooking(publicId, reason, customerPublicId);

        return ResponseEntity.ok(ApiResponse.<ServiceBookingDTO>builder()
                .success(true)
                .message("Booking cancelled successfully")
                .data(cancelledBooking)
                .build());
    }

    /**
     * Start service (provider action)
     */
    @PostMapping("/{publicId}/start")
    @PreAuthorize("hasAnyAuthority('ROLE_SERVICE_PROVIDER', 'ROLE_ADMIN')")
    public ResponseEntity<ApiResponse<ServiceBookingDTO>> startService(
            @PathVariable String publicId,
            @AuthenticationPrincipal UserPrincipal currentUser) {

        log.info("Provider starting service: {}", publicId);

        String providerPublicId = currentUser.getId().toString();
        ServiceBookingDTO startedBooking = serviceBookingService.startService(publicId, providerPublicId);

        return ResponseEntity.ok(ApiResponse.<ServiceBookingDTO>builder()
                .success(true)
                .message("Service started successfully")
                .data(startedBooking)
                .build());
    }

    /**
     * Complete service (provider action)
     */
    @PostMapping("/{publicId}/complete")
    @PreAuthorize("hasAnyAuthority('ROLE_SERVICE_PROVIDER', 'ROLE_ADMIN')")
    public ResponseEntity<ApiResponse<ServiceBookingDTO>> completeService(
            @PathVariable String publicId,
            @AuthenticationPrincipal UserPrincipal currentUser) {

        log.info("Provider completing service: {}", publicId);

        String providerPublicId = currentUser.getId().toString();
        ServiceBookingDTO completedBooking = serviceBookingService.completeService(publicId, providerPublicId);

        return ResponseEntity.ok(ApiResponse.<ServiceBookingDTO>builder()
                .success(true)
                .message("Service completed successfully")
                .data(completedBooking)
                .build());
    }

    /**
     * Update payment status
     */
    @PatchMapping("/{publicId}/payment")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<ServiceBookingDTO>> updatePaymentStatus(
            @PathVariable String publicId,
            @RequestParam String paymentIntentId,
            @AuthenticationPrincipal UserPrincipal currentUser) {

        log.info("Updating payment status for booking: {}", publicId);

        String customerPublicId = currentUser.getId().toString();
        ServiceBookingDTO paidBooking = serviceBookingService.markAsPaid(publicId, paymentIntentId, customerPublicId);

        return ResponseEntity.ok(ApiResponse.<ServiceBookingDTO>builder()
                .success(true)
                .message("Payment processed successfully")
                .data(paidBooking)
                .build());
    }

    /**
     * Request refund
     */
    @PostMapping("/{publicId}/refund")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<ServiceBookingDTO>> requestRefund(
            @PathVariable String publicId,
            @AuthenticationPrincipal UserPrincipal currentUser) {

        log.info("Requesting refund for booking: {}", publicId);

        String customerPublicId = currentUser.getId().toString();
        ServiceBookingDTO refundedBooking = serviceBookingService.processRefund(publicId, customerPublicId);

        return ResponseEntity.ok(ApiResponse.<ServiceBookingDTO>builder()
                .success(true)
                .message("Refund processed successfully")
                .data(refundedBooking)
                .build());
    }

    /**
     * Check availability for a service
     */
    @GetMapping("/check-availability")
    public ResponseEntity<ApiResponse<Boolean>> checkAvailability(
            @RequestParam String servicePublicId,
            @RequestParam String date,
            @RequestParam(required = false) String startTime,
            @RequestParam(required = false) String endTime) {

        log.debug("Checking availability for service: {}", servicePublicId);

        boolean isAvailable = serviceBookingService.checkAvailability(servicePublicId, date, startTime, endTime);

        return ResponseEntity.ok(ApiResponse.<Boolean>builder()
                .success(true)
                .data(isAvailable)
                .message(isAvailable ? "Time slot is available" : "Time slot is not available")
                .build());
    }

    /**
     * Get booking statistics for provider
     */
    @GetMapping("/provider-bookings/statistics")
    @PreAuthorize("hasAnyAuthority('ROLE_SERVICE_PROVIDER', 'ROLE_ADMIN')")
    public ResponseEntity<ApiResponse<Object>> getBookingStatistics(
            @AuthenticationPrincipal UserPrincipal currentUser) {

        log.debug("Fetching booking statistics for provider: {}", currentUser.getId());

        String providerPublicId = currentUser.getId().toString();
        Object statistics = serviceBookingService.getProviderStatistics(providerPublicId);

        return ResponseEntity.ok(ApiResponse.builder()
                .success(true)
                .data(statistics)
                .build());
    }

    /**
     * Delete booking (admin only)
     */
    @DeleteMapping("/{publicId}")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteBooking(@PathVariable String publicId) {

        log.info("Admin deleting booking: {}", publicId);

        serviceBookingService.deleteBooking(publicId);

        return ResponseEntity.ok(ApiResponse.<Void>builder()
                .success(true)
                .message("Booking deleted successfully")
                .build());
    }
}