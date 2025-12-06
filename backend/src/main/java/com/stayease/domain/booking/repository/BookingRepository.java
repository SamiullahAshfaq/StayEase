package com.stayease.domain.booking.repository;

import com.stayease.domain.booking.entity.Booking;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {
    
    Optional<Booking> findByPublicId(UUID publicId);
    
    List<Booking> findByGuestPublicId(UUID guestPublicId);
    
    Page<Booking> findByGuestPublicId(UUID guestPublicId, Pageable pageable);
    
    @Query("SELECT b FROM Booking b WHERE b.listingPublicId = :listingPublicId")
    List<Booking> findByListingPublicId(@Param("listingPublicId") UUID listingPublicId);
    
    @Query("SELECT b FROM Booking b WHERE b.listingPublicId = :listingPublicId " +
           "AND b.bookingStatus NOT IN ('CANCELLED', 'REJECTED') " +
           "AND ((b.checkInDate <= :checkOut AND b.checkOutDate >= :checkIn))")
    List<Booking> findConflictingBookings(@Param("listingPublicId") UUID listingPublicId,
                                           @Param("checkIn") LocalDate checkIn,
                                           @Param("checkOut") LocalDate checkOut);
    
    @Query("SELECT b FROM Booking b WHERE b.guestPublicId = :guestPublicId " +
           "AND b.bookingStatus = :status")
    Page<Booking> findByGuestAndStatus(@Param("guestPublicId") UUID guestPublicId,
                                        @Param("status") Booking.BookingStatus status,
                                        Pageable pageable);
    
    @Query("SELECT COUNT(b) FROM Booking b WHERE b.guestPublicId = :guestPublicId")
    Long countByGuest(@Param("guestPublicId") UUID guestPublicId);
    
    boolean existsByPublicId(UUID publicId);
}