package com.stayease.domain.serviceoffering.repository;

import com.stayease.domain.serviceoffering.entity.ServiceBooking;
import com.stayease.domain.serviceoffering.entity.ServiceBooking.BookingStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface ServiceBookingRepository extends JpaRepository<ServiceBooking, Long> {

    // Find by public ID
    Optional<ServiceBooking> findByPublicId(String publicId);

    // Find by customer
    Page<ServiceBooking> findByCustomerPublicIdOrderByCreatedAtDesc(String customerPublicId, Pageable pageable);

    List<ServiceBooking> findByCustomerPublicIdAndStatusOrderByBookingDateDesc(
            String customerPublicId,
            BookingStatus status);

    // Find by provider
    Page<ServiceBooking> findByProviderPublicIdOrderByCreatedAtDesc(String providerPublicId, Pageable pageable);

    List<ServiceBooking> findByProviderPublicIdAndStatusOrderByBookingDateDesc(
            String providerPublicId,
            BookingStatus status);

    // Find by service
    Page<ServiceBooking> findByServicePublicIdOrderByCreatedAtDesc(String servicePublicId, Pageable pageable);

    // Find by status
    Page<ServiceBooking> findByStatusOrderByCreatedAtDesc(BookingStatus status, Pageable pageable);

    // Find by date range
    @Query("SELECT b FROM ServiceBooking b WHERE b.bookingDate >= :startDate " +
            "AND b.bookingDate <= :endDate ORDER BY b.bookingDate ASC")
    List<ServiceBooking> findByDateRange(
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate);

    // Find upcoming bookings
    @Query("SELECT b FROM ServiceBooking b WHERE b.customerPublicId = :customerPublicId " +
            "AND b.bookingDate >= :today AND b.status IN ('CONFIRMED', 'PAID') " +
            "ORDER BY b.bookingDate ASC")
    List<ServiceBooking> findUpcomingBookings(
            @Param("customerPublicId") String customerPublicId,
            @Param("today") LocalDate today);

    // Find past bookings
    @Query("SELECT b FROM ServiceBooking b WHERE b.customerPublicId = :customerPublicId " +
            "AND (b.bookingDate < :today OR b.status = 'COMPLETED') " +
            "ORDER BY b.bookingDate DESC")
    Page<ServiceBooking> findPastBookings(
            @Param("customerPublicId") String customerPublicId,
            @Param("today") LocalDate today,
            Pageable pageable);

    // Check availability
    @Query("SELECT COUNT(b) > 0 FROM ServiceBooking b " +
            "WHERE b.servicePublicId = :servicePublicId " +
            "AND b.bookingDate = :date " +
            "AND b.status IN ('CONFIRMED', 'PAID', 'IN_PROGRESS') " +
            "AND ((b.startTime <= :endTime AND b.endTime > :startTime))")
    boolean hasConflictingBooking(
            @Param("servicePublicId") String servicePublicId,
            @Param("date") LocalDate date,
            @Param("startTime") java.time.LocalTime startTime,
            @Param("endTime") java.time.LocalTime endTime);

    // Count bookings
    long countByServicePublicId(String servicePublicId);

    long countByCustomerPublicId(String customerPublicId);

    long countByProviderPublicId(String providerPublicId);

    // Count by status
    long countByServicePublicIdAndStatus(String servicePublicId, BookingStatus status);

    // Revenue statistics
    @Query("SELECT SUM(b.totalPrice) FROM ServiceBooking b " +
            "WHERE b.providerPublicId = :providerPublicId " +
            "AND b.status = 'COMPLETED' " +
            "AND b.serviceCompletedAt >= :startDate AND b.serviceCompletedAt <= :endDate")
    java.math.BigDecimal calculateRevenue(
            @Param("providerPublicId") String providerPublicId,
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate);
}
