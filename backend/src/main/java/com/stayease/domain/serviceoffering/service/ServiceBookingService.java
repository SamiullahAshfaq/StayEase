package com.stayease.domain.serviceoffering.service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.stayease.domain.serviceoffering.dto.CreateServiceBookingDTO;
import com.stayease.domain.serviceoffering.dto.ServiceBookingDTO;
import com.stayease.domain.serviceoffering.entity.ServiceBooking;
import com.stayease.domain.serviceoffering.entity.ServiceBooking.BookingStatus;
import com.stayease.domain.serviceoffering.entity.ServiceBooking.PaymentStatus;
import com.stayease.domain.serviceoffering.entity.ServiceOffering;
import com.stayease.domain.serviceoffering.repository.ServiceBookingRepository;
import com.stayease.domain.serviceoffering.repository.ServiceOfferingRepository;
import com.stayease.exception.BadRequestException;
import com.stayease.exception.ForbiddenException;
import com.stayease.exception.NotFoundException;
import com.stayease.shared.mapper.ServiceBookingMapper;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * Service for managing Service Bookings
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class ServiceBookingService {

    private final ServiceBookingRepository serviceBookingRepository;
    private final ServiceOfferingRepository serviceOfferingRepository;
    private final ServiceBookingMapper serviceBookingMapper;

    /**
     * Create a new service booking
     */
    public ServiceBookingDTO createBooking(CreateServiceBookingDTO dto, String customerPublicId) {
        log.info("Creating new service booking for customer: {}", customerPublicId);

        // Validate service exists and is bookable
        ServiceOffering service = serviceOfferingRepository.findByPublicId(dto.getServicePublicId())
                .orElseThrow(() -> new NotFoundException("Service not found with ID: " + dto.getServicePublicId()));

        if (!service.isBookable()) {
            throw new BadRequestException("Service is not available for booking");
        }

        // Check availability
        if (dto.getStartTime() != null && dto.getEndTime() != null) {
            boolean hasConflict = serviceBookingRepository.hasConflictingBooking(
                    dto.getServicePublicId(),
                    dto.getBookingDate(),
                    dto.getStartTime(),
                    dto.getEndTime()
            );

            if (hasConflict) {
                throw new BadRequestException("Selected time slot is not available");
            }
        }

        // Validate advance booking requirement
        if (service.getAdvanceBookingHours() != null) {
            LocalDateTime bookingDateTime = LocalDateTime.of(dto.getBookingDate(), 
                    dto.getStartTime() != null ? dto.getStartTime() : LocalTime.MIDNIGHT);
            LocalDateTime minimumBookingTime = LocalDateTime.now().plusHours(service.getAdvanceBookingHours());

            if (bookingDateTime.isBefore(minimumBookingTime)) {
                throw new BadRequestException(
                        "Booking must be made at least " + service.getAdvanceBookingHours() + " hours in advance");
            }
        }

        // Calculate pricing
        BigDecimal basePrice = service.getBasePrice();
        BigDecimal extraPersonCharge = BigDecimal.ZERO;
        BigDecimal surcharges = BigDecimal.ZERO;

        // Calculate extra person charge
        if (dto.getNumberOfPeople() != null && service.getMinCapacity() != null 
                && dto.getNumberOfPeople() > service.getMinCapacity()) {
            int extraPersons = dto.getNumberOfPeople() - service.getMinCapacity();
            if (service.getExtraPersonPrice() != null) {
                extraPersonCharge = service.getExtraPersonPrice().multiply(BigDecimal.valueOf(extraPersons));
            }
        }

        // Calculate weekend surcharge
        if (dto.getBookingDate().getDayOfWeek().getValue() >= 6 && service.getWeekendSurcharge() != null) {
            surcharges = surcharges.add(service.getWeekendSurcharge());
        }

        // Calculate total
        BigDecimal serviceFee = basePrice.multiply(BigDecimal.valueOf(0.05)); // 5% service fee
        BigDecimal tax = basePrice.multiply(BigDecimal.valueOf(0.10)); // 10% tax
        BigDecimal totalPrice = basePrice.add(extraPersonCharge).add(surcharges).add(serviceFee).add(tax);

        // Create booking
        ServiceBooking booking = ServiceBooking.builder()
                .publicId(UUID.randomUUID().toString())
                .servicePublicId(dto.getServicePublicId())
                .customerPublicId(customerPublicId)
                .providerPublicId(service.getProviderPublicId())
                .bookingDate(dto.getBookingDate())
                .startTime(dto.getStartTime())
                .endTime(dto.getEndTime())
                .durationMinutes(service.getDurationMinutes())
                .numberOfPeople(dto.getNumberOfPeople() != null ? dto.getNumberOfPeople() : 1)
                .numberOfItems(dto.getNumberOfItems())
                .customerAddress(dto.getCustomerAddress())
                .latitude(dto.getLatitude())
                .longitude(dto.getLongitude())
                .specialRequests(dto.getSpecialRequests())
                .customerPhone(dto.getCustomerPhone())
                .customerEmail(dto.getCustomerEmail())
                .basePrice(basePrice)
                .extraPersonCharge(extraPersonCharge)
                .surcharges(surcharges)
                .serviceFee(serviceFee)
                .tax(tax)
                .totalPrice(totalPrice)
                .status(service.getIsInstantBooking() ? BookingStatus.CONFIRMED : BookingStatus.PENDING)
                .paymentStatus(PaymentStatus.PENDING)
                .isRefundable(true)
                .build();

        if (service.getIsInstantBooking()) {
            booking.setConfirmedAt(LocalDateTime.now());
        }

        ServiceBooking savedBooking = serviceBookingRepository.save(booking);
        
        // Update service statistics
        service.setTotalBookings(service.getTotalBookings() + 1);
        service.setLastBookedAt(LocalDateTime.now());
        serviceOfferingRepository.save(service);

        log.info("Service booking created successfully with ID: {}", savedBooking.getPublicId());

        return serviceBookingMapper.toDTO(savedBooking);
    }

    /**
     * Get booking by public ID
     */
    @Transactional(readOnly = true)
    public ServiceBookingDTO getBookingByPublicId(String publicId, String userPublicId) {
        log.debug("Fetching booking with publicId: {}", publicId);

        ServiceBooking booking = serviceBookingRepository.findByPublicId(publicId)
                .orElseThrow(() -> new NotFoundException("Booking not found with ID: " + publicId));

        // Verify user has access to this booking
        if (!booking.getCustomerPublicId().equals(userPublicId) 
                && !booking.getProviderPublicId().equals(userPublicId)) {
            throw new ForbiddenException("You don't have permission to view this booking");
        }

        return serviceBookingMapper.toDTO(booking);
    }

    /**
     * Get all bookings for a customer
     */
    @Transactional(readOnly = true)
    public Page<ServiceBookingDTO> getCustomerBookings(String customerPublicId, int page, int size) {
        log.debug("Fetching bookings for customer: {}", customerPublicId);

        Pageable pageable = PageRequest.of(page, size);
        Page<ServiceBooking> bookings = serviceBookingRepository
                .findByCustomerPublicIdOrderByCreatedAtDesc(customerPublicId, pageable);

        return bookings.map(serviceBookingMapper::toDTO);
    }

    /**
     * Get upcoming bookings for customer
     */
    @Transactional(readOnly = true)
    public List<ServiceBookingDTO> getUpcomingBookings(String customerPublicId) {
        log.debug("Fetching upcoming bookings for customer: {}", customerPublicId);

        LocalDate today = LocalDate.now();
        List<ServiceBooking> bookings = serviceBookingRepository
                .findUpcomingBookings(customerPublicId, today);

        return bookings.stream()
                .map(serviceBookingMapper::toDTO)
                .collect(Collectors.toList());
    }

    /**
     * Get past bookings for customer
     */
    @Transactional(readOnly = true)
    public Page<ServiceBookingDTO> getPastBookings(String customerPublicId, int page, int size) {
        log.debug("Fetching past bookings for customer: {}", customerPublicId);

        LocalDate today = LocalDate.now();
        Pageable pageable = PageRequest.of(page, size);
        Page<ServiceBooking> bookings = serviceBookingRepository
                .findPastBookings(customerPublicId, today, pageable);

        return bookings.map(serviceBookingMapper::toDTO);
    }

    /**
     * Get bookings by status for customer
     */
    @Transactional(readOnly = true)
    public List<ServiceBookingDTO> getCustomerBookingsByStatus(String customerPublicId, BookingStatus status) {
        log.debug("Fetching bookings with status {} for customer: {}", status, customerPublicId);

        List<ServiceBooking> bookings = serviceBookingRepository
                .findByCustomerPublicIdAndStatusOrderByBookingDateDesc(customerPublicId, status);

        return bookings.stream()
                .map(serviceBookingMapper::toDTO)
                .collect(Collectors.toList());
    }

    /**
     * Get all bookings for a provider
     */
    @Transactional(readOnly = true)
    public Page<ServiceBookingDTO> getProviderBookings(String providerPublicId, int page, int size) {
        log.debug("Fetching bookings for provider: {}", providerPublicId);

        Pageable pageable = PageRequest.of(page, size);
        Page<ServiceBooking> bookings = serviceBookingRepository
                .findByProviderPublicIdOrderByCreatedAtDesc(providerPublicId, pageable);

        return bookings.map(serviceBookingMapper::toDTO);
    }

    /**
     * Get bookings by status for provider
     */
    @Transactional(readOnly = true)
    public List<ServiceBookingDTO> getProviderBookingsByStatus(String providerPublicId, BookingStatus status) {
        log.debug("Fetching bookings with status {} for provider: {}", status, providerPublicId);

        List<ServiceBooking> bookings = serviceBookingRepository
                .findByProviderPublicIdAndStatusOrderByBookingDateDesc(providerPublicId, status);

        return bookings.stream()
                .map(serviceBookingMapper::toDTO)
                .collect(Collectors.toList());
    }

    /**
     * Get bookings for a specific service
     */
    @Transactional(readOnly = true)
    public Page<ServiceBookingDTO> getServiceBookings(String servicePublicId, String providerPublicId, 
                                                      int page, int size) {
        log.debug("Fetching bookings for service: {}", servicePublicId);

        // Verify provider owns this service
        ServiceOffering service = serviceOfferingRepository.findByPublicId(servicePublicId)
                .orElseThrow(() -> new NotFoundException("Service not found with ID: " + servicePublicId));

        if (!service.getProviderPublicId().equals(providerPublicId)) {
            throw new ForbiddenException("You don't have permission to view bookings for this service");
        }

        Pageable pageable = PageRequest.of(page, size);
        Page<ServiceBooking> bookings = serviceBookingRepository
                .findByServicePublicIdOrderByCreatedAtDesc(servicePublicId, pageable);

        return bookings.map(serviceBookingMapper::toDTO);
    }

    /**
     * Confirm booking (provider action)
     */
    public ServiceBookingDTO confirmBooking(String publicId, String providerPublicId) {
        log.info("Provider confirming booking: {}", publicId);

        ServiceBooking booking = serviceBookingRepository.findByPublicId(publicId)
                .orElseThrow(() -> new NotFoundException("Booking not found with ID: " + publicId));

        if (!booking.getProviderPublicId().equals(providerPublicId)) {
            throw new ForbiddenException("You don't have permission to confirm this booking");
        }

        if (booking.getStatus() != BookingStatus.PENDING) {
            throw new BadRequestException("Only pending bookings can be confirmed");
        }

        booking.confirm();
        ServiceBooking confirmedBooking = serviceBookingRepository.save(booking);

        log.info("Booking confirmed successfully: {}", publicId);

        return serviceBookingMapper.toDTO(confirmedBooking);
    }

    /**
     * Reject booking (provider action)
     */
    public ServiceBookingDTO rejectBooking(String publicId, String reason, String providerPublicId) {
        log.info("Provider rejecting booking: {}", publicId);

        ServiceBooking booking = serviceBookingRepository.findByPublicId(publicId)
                .orElseThrow(() -> new NotFoundException("Booking not found with ID: " + publicId));

        if (!booking.getProviderPublicId().equals(providerPublicId)) {
            throw new ForbiddenException("You don't have permission to reject this booking");
        }

        if (booking.getStatus() != BookingStatus.PENDING) {
            throw new BadRequestException("Only pending bookings can be rejected");
        }

        booking.reject(reason);
        ServiceBooking rejectedBooking = serviceBookingRepository.save(booking);

        log.info("Booking rejected: {}", publicId);

        return serviceBookingMapper.toDTO(rejectedBooking);
    }

    /**
     * Cancel booking (customer action)
     */
    public ServiceBookingDTO cancelBooking(String publicId, String reason, String customerPublicId) {
        log.info("Customer cancelling booking: {}", publicId);

        ServiceBooking booking = serviceBookingRepository.findByPublicId(publicId)
                .orElseThrow(() -> new NotFoundException("Booking not found with ID: " + publicId));

        if (!booking.getCustomerPublicId().equals(customerPublicId)) {
            throw new ForbiddenException("You don't have permission to cancel this booking");
        }

        if (!booking.canCancel()) {
            throw new BadRequestException("This booking cannot be cancelled");
        }

        booking.cancel(reason);
        ServiceBooking cancelledBooking = serviceBookingRepository.save(booking);

        log.info("Booking cancelled successfully: {}", publicId);

        return serviceBookingMapper.toDTO(cancelledBooking);
    }

    /**
     * Start service (provider action)
     */
    public ServiceBookingDTO startService(String publicId, String providerPublicId) {
        log.info("Provider starting service: {}", publicId);

        ServiceBooking booking = serviceBookingRepository.findByPublicId(publicId)
                .orElseThrow(() -> new NotFoundException("Booking not found with ID: " + publicId));

        if (!booking.getProviderPublicId().equals(providerPublicId)) {
            throw new ForbiddenException("You don't have permission to start this service");
        }

        if (booking.getStatus() != BookingStatus.PAID && booking.getStatus() != BookingStatus.CONFIRMED) {
            throw new BadRequestException("Service can only be started for confirmed or paid bookings");
        }

        booking.startService();
        ServiceBooking startedBooking = serviceBookingRepository.save(booking);

        log.info("Service started successfully: {}", publicId);

        return serviceBookingMapper.toDTO(startedBooking);
    }

    /**
     * Complete service (provider action)
     */
    public ServiceBookingDTO completeService(String publicId, String providerPublicId) {
        log.info("Provider completing service: {}", publicId);

        ServiceBooking booking = serviceBookingRepository.findByPublicId(publicId)
                .orElseThrow(() -> new NotFoundException("Booking not found with ID: " + publicId));

        if (!booking.getProviderPublicId().equals(providerPublicId)) {
            throw new ForbiddenException("You don't have permission to complete this service");
        }

        if (booking.getStatus() != BookingStatus.IN_PROGRESS) {
            throw new BadRequestException("Only in-progress services can be completed");
        }

        booking.complete();
        ServiceBooking completedBooking = serviceBookingRepository.save(booking);

        log.info("Service completed successfully: {}", publicId);

        return serviceBookingMapper.toDTO(completedBooking);
    }

    /**
     * Mark booking as paid
     */
    public ServiceBookingDTO markAsPaid(String publicId, String paymentIntentId, String customerPublicId) {
        log.info("Marking booking as paid: {}", publicId);

        ServiceBooking booking = serviceBookingRepository.findByPublicId(publicId)
                .orElseThrow(() -> new NotFoundException("Booking not found with ID: " + publicId));

        if (!booking.getCustomerPublicId().equals(customerPublicId)) {
            throw new ForbiddenException("You don't have permission to update payment for this booking");
        }

        booking.setPaymentIntentId(paymentIntentId);
        booking.markPaid();

        ServiceBooking paidBooking = serviceBookingRepository.save(booking);

        log.info("Booking marked as paid: {}", publicId);

        return serviceBookingMapper.toDTO(paidBooking);
    }

    /**
     * Process refund
     */
    public ServiceBookingDTO processRefund(String publicId, String customerPublicId) {
        log.info("Processing refund for booking: {}", publicId);

        ServiceBooking booking = serviceBookingRepository.findByPublicId(publicId)
                .orElseThrow(() -> new NotFoundException("Booking not found with ID: " + publicId));

        if (!booking.getCustomerPublicId().equals(customerPublicId)) {
            throw new ForbiddenException("You don't have permission to request refund for this booking");
        }

        if (!booking.getIsRefundable()) {
            throw new BadRequestException("This booking is not eligible for refund");
        }

        if (booking.getStatus() != BookingStatus.CANCELLED && booking.getStatus() != BookingStatus.REJECTED) {
            throw new BadRequestException("Only cancelled or rejected bookings can be refunded");
        }

        // Calculate refund amount (could be partial based on cancellation policy)
        BigDecimal refundAmount = booking.getTotalPrice();

        booking.refund(refundAmount);
        ServiceBooking refundedBooking = serviceBookingRepository.save(booking);

        log.info("Refund processed successfully: {}", publicId);

        return serviceBookingMapper.toDTO(refundedBooking);
    }

    /**
     * Check availability for a service
     */
    @Transactional(readOnly = true)
    public boolean checkAvailability(String servicePublicId, String dateStr, 
                                    String startTimeStr, String endTimeStr) {
        log.debug("Checking availability for service: {}", servicePublicId);

        ServiceOffering service = serviceOfferingRepository.findByPublicId(servicePublicId)
                .orElseThrow(() -> new NotFoundException("Service not found with ID: " + servicePublicId));

        if (!service.isBookable()) {
            return false;
        }

        LocalDate date = LocalDate.parse(dateStr);
        
        if (startTimeStr != null && endTimeStr != null) {
            LocalTime startTime = LocalTime.parse(startTimeStr);
            LocalTime endTime = LocalTime.parse(endTimeStr);

            return !serviceBookingRepository.hasConflictingBooking(
                    servicePublicId, date, startTime, endTime);
        }

        return true;
    }

    /**
     * Get provider booking statistics
     */
    @Transactional(readOnly = true)
    public Map<String, Object> getProviderStatistics(String providerPublicId) {
        log.debug("Fetching statistics for provider: {}", providerPublicId);

        Map<String, Object> statistics = new HashMap<>();

        long totalBookings = serviceBookingRepository.countByProviderPublicId(providerPublicId);
        long pendingBookings = serviceBookingRepository.findByProviderPublicIdAndStatusOrderByBookingDateDesc(
            providerPublicId, BookingStatus.PENDING).size();
        long confirmedBookings = serviceBookingRepository.findByProviderPublicIdAndStatusOrderByBookingDateDesc(
            providerPublicId, BookingStatus.CONFIRMED).size();
        long completedBookings = serviceBookingRepository.findByProviderPublicIdAndStatusOrderByBookingDateDesc(
            providerPublicId, BookingStatus.COMPLETED).size();

        LocalDateTime startOfMonth = LocalDateTime.now().withDayOfMonth(1).withHour(0).withMinute(0);
        LocalDateTime endOfMonth = LocalDateTime.now().withDayOfMonth(
                LocalDateTime.now().toLocalDate().lengthOfMonth()).withHour(23).withMinute(59);

        BigDecimal monthlyRevenue = serviceBookingRepository.calculateRevenue(
                providerPublicId, startOfMonth, endOfMonth);

        statistics.put("totalBookings", totalBookings);
        statistics.put("pendingBookings", pendingBookings);
        statistics.put("confirmedBookings", confirmedBookings);
        statistics.put("completedBookings", completedBookings);
        statistics.put("monthlyRevenue", monthlyRevenue != null ? monthlyRevenue : BigDecimal.ZERO);

        return statistics;
    }

    /**
     * Delete booking (admin only)
     */
    public void deleteBooking(String publicId) {
        log.info("Deleting booking: {}", publicId);

        ServiceBooking booking = serviceBookingRepository.findByPublicId(publicId)
                .orElseThrow(() -> new NotFoundException("Booking not found with ID: " + publicId));

        serviceBookingRepository.delete(booking);
        log.info("Booking deleted successfully: {}", publicId);
    }
}