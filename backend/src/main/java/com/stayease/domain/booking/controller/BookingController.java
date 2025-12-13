// package com.stayease.domain.booking.controller;

// import com.stayease.domain.booking.dto.*;
// import com.stayease.domain.booking.entity.Booking;
// import com.stayease.domain.booking.service.BookingService;
// import com.stayease.security.UserPrincipal;
// import com.stayease.shared.dto.ApiResponse;
// import jakarta.validation.Valid;
// import lombok.RequiredArgsConstructor;
// import lombok.extern.slf4j.Slf4j;
// import org.springframework.data.domain.Page;
// import org.springframework.http.HttpStatus;
// import org.springframework.http.ResponseEntity;
// import org.springframework.security.access.prepost.PreAuthorize;
// import org.springframework.security.core.annotation.AuthenticationPrincipal;
// import org.springframework.web.bind.annotation.*;
// import java.time.LocalDate;
// import java.util.List;
// import java.util.UUID;

// @RestController
// @RequestMapping("/api/bookings")
// @RequiredArgsConstructor
// @Slf4j
// @CrossOrigin(origins = "*", maxAge = 3600)
// public class BookingController {

//     private final BookingService bookingService;

//     @PostMapping
//     @PreAuthorize("isAuthenticated()")
//     public ResponseEntity<ApiResponse<BookingDTO>> createBooking(
//             @Valid @RequestBody CreateBookingDTO dto,
//             @AuthenticationPrincipal UserPrincipal currentUser) {
        
//         log.info("Creating booking for user: {}", currentUser.getPublicId());
        
//         BookingDTO booking = bookingService.createBooking(dto, currentUser.getPublicId());
        
//         return ResponseEntity
//                 .status(HttpStatus.CREATED)
//                 .body(ApiResponse.<BookingDTO>builder()
//                         .success(true)
//                         .message("Booking created successfully")
//                         .data(booking)
//                         .build());
//     }

//     @GetMapping("/{publicId}")
//     @PreAuthorize("isAuthenticated()")
//     public ResponseEntity<ApiResponse<BookingDTO>> getBookingById(
//             @PathVariable UUID publicId,
//             @AuthenticationPrincipal UserPrincipal currentUser) {
        
//         log.debug("Fetching booking: {}", publicId);
        
//         BookingDTO booking = bookingService.getBookingByPublicId(publicId, currentUser.getPublicId());
        
//         return ResponseEntity.ok(ApiResponse.<BookingDTO>builder()
//                 .success(true)
//                 .data(booking)
//                 .build());
//     }

//     @GetMapping("/my-bookings")
//     @PreAuthorize("isAuthenticated()")
//     public ResponseEntity<ApiResponse<Page<BookingDTO>>> getMyBookings(
//             @RequestParam(defaultValue = "0") int page,
//             @RequestParam(defaultValue = "20") int size,
//             @AuthenticationPrincipal UserPrincipal currentUser) {
        
//         log.debug("Fetching bookings for user: {}", currentUser.getPublicId());
        
//         Page<BookingDTO> bookings = bookingService.getBookingsByGuest(
//                 currentUser.getPublicId(), page, size);
        
//         return ResponseEntity.ok(ApiResponse.<Page<BookingDTO>>builder()
//                 .success(true)
//                 .data(bookings)
//                 .build());
//     }

//     @GetMapping("/listing/{listingPublicId}")
//     @PreAuthorize("hasAnyAuthority('ROLE_LANDLORD', 'ROLE_ADMIN')")
//     public ResponseEntity<ApiResponse<List<BookingDTO>>> getBookingsByListing(
//             @PathVariable UUID listingPublicId,
//             @AuthenticationPrincipal UserPrincipal currentUser) {
        
//         log.debug("Fetching bookings for listing: {}", listingPublicId);
        
//         List<BookingDTO> bookings = bookingService.getBookingsByListing(
//                 listingPublicId, currentUser.getPublicId());
        
//         return ResponseEntity.ok(ApiResponse.<List<BookingDTO>>builder()
//                 .success(true)
//                 .data(bookings)
//                 .build());
//     }

//     @PatchMapping("/{publicId}/status")
//     @PreAuthorize("hasAnyAuthority('ROLE_LANDLORD', 'ROLE_ADMIN')")
//     public ResponseEntity<ApiResponse<BookingDTO>> updateBookingStatus(
//             @PathVariable UUID publicId,
//             @RequestParam Booking.BookingStatus status,
//             @AuthenticationPrincipal UserPrincipal currentUser) {
        
//         log.info("Updating booking status: {} to {}", publicId, status);
        
//         BookingDTO booking = bookingService.updateBookingStatus(publicId, status, currentUser.getPublicId());
        
//         return ResponseEntity.ok(ApiResponse.<BookingDTO>builder()
//                 .success(true)
//                 .message("Booking status updated successfully")
//                 .data(booking)
//                 .build());
//     }

//     @PostMapping("/{publicId}/cancel")
//     @PreAuthorize("isAuthenticated()")
//     public ResponseEntity<ApiResponse<BookingDTO>> cancelBooking(
//             @PathVariable UUID publicId,
//             @RequestParam(required = false) String reason,
//             @AuthenticationPrincipal UserPrincipal currentUser) {
        
//         log.info("Cancelling booking: {}", publicId);
        
//         BookingDTO booking = bookingService.cancelBooking(publicId, reason, currentUser.getPublicId());
        
//         return ResponseEntity.ok(ApiResponse.<BookingDTO>builder()
//                 .success(true)
//                 .message("Booking cancelled successfully")
//                 .data(booking)
//                 .build());
//     }

//     @GetMapping("/listing/{listingPublicId}/unavailable-dates")
//     public ResponseEntity<ApiResponse<List<LocalDate>>> getUnavailableDates(
//             @PathVariable UUID listingPublicId) {
        
//         List<LocalDate> dates = bookingService.getUnavailableDates(listingPublicId);
        
//         return ResponseEntity.ok(ApiResponse.<List<LocalDate>>builder()
//                 .success(true)
//                 .data(dates)
//                 .build());
//     }
// }