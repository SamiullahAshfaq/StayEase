package com.stayease.domain.listing.controller;

import com.stayease.domain.listing.dto.*;
import com.stayease.domain.listing.entity.Listing;
import com.stayease.domain.listing.service.ListingService;
import com.stayease.security.UserPrincipal;
import com.stayease.shared.dto.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/listings")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*", maxAge = 3600)
public class ListingController {

    private final ListingService listingService;

    @PostMapping
    @PreAuthorize("hasAnyAuthority('ROLE_LANDLORD', 'ROLE_ADMIN')")
    public ResponseEntity<ApiResponse<ListingDTO>> createListing(
            @Valid @RequestBody CreateListingDTO dto,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        
        log.info("Creating listing for user: {}", currentUser.getPublicId());
        
        ListingDTO createdListing = listingService.createListing(dto, currentUser.getPublicId());
        
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.<ListingDTO>builder()
                        .success(true)
                        .message("Listing created successfully")
                        .data(createdListing)
                        .build());
    }

    @GetMapping("/{publicId}")
    public ResponseEntity<ApiResponse<ListingDTO>> getListingById(@PathVariable UUID publicId) {
        log.debug("Fetching listing: {}", publicId);
        
        ListingDTO listing = listingService.getListingByPublicId(publicId);
        
        return ResponseEntity.ok(ApiResponse.<ListingDTO>builder()
                .success(true)
                .data(listing)
                .build());
    }

    @GetMapping
    public ResponseEntity<ApiResponse<Page<ListingDTO>>> getAllListings(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "DESC") String sortDirection) {
        
        log.debug("Fetching all listings - page: {}, size: {}", page, size);
        
        Page<ListingDTO> listings = listingService.getAllListings(page, size, sortBy, sortDirection);
        
        return ResponseEntity.ok(ApiResponse.<Page<ListingDTO>>builder()
                .success(true)
                .data(listings)
                .build());
    }

    @PostMapping("/search")
    public ResponseEntity<ApiResponse<Page<ListingDTO>>> searchListings(
            @RequestBody SearchListingDTO searchDTO) {
        
        log.debug("Searching listings with criteria: {}", searchDTO);
        
        Page<ListingDTO> listings = listingService.searchListings(searchDTO);
        
        return ResponseEntity.ok(ApiResponse.<Page<ListingDTO>>builder()
                .success(true)
                .data(listings)
                .build());
    }

    @GetMapping("/category/{category}")
    public ResponseEntity<ApiResponse<Page<ListingDTO>>> getListingsByCategory(
            @PathVariable String category,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        
        log.debug("Fetching listings by category: {}", category);
        
        Page<ListingDTO> listings = listingService.getListingsByCategory(category, page, size);
        
        return ResponseEntity.ok(ApiResponse.<Page<ListingDTO>>builder()
                .success(true)
                .data(listings)
                .build());
    }

    @GetMapping("/landlord/{landlordPublicId}")
    public ResponseEntity<ApiResponse<List<ListingDTO>>> getListingsByLandlord(
            @PathVariable UUID landlordPublicId) {
        
        log.debug("Fetching listings for landlord: {}", landlordPublicId);
        
        List<ListingDTO> listings = listingService.getListingsByLandlord(landlordPublicId);
        
        return ResponseEntity.ok(ApiResponse.<List<ListingDTO>>builder()
                .success(true)
                .data(listings)
                .build());
    }

    @GetMapping("/my-listings")
    @PreAuthorize("hasAnyAuthority('ROLE_LANDLORD', 'ROLE_ADMIN')")
    public ResponseEntity<ApiResponse<List<ListingDTO>>> getMyListings(
            @AuthenticationPrincipal UserPrincipal currentUser) {
        
        log.debug("Fetching listings for current user: {}", currentUser.getPublicId());
        
        List<ListingDTO> listings = listingService.getListingsByLandlord(currentUser.getPublicId());
        
        return ResponseEntity.ok(ApiResponse.<List<ListingDTO>>builder()
                .success(true)
                .data(listings)
                .build());
    }

    @PutMapping("/{publicId}")
    @PreAuthorize("hasAnyAuthority('ROLE_LANDLORD', 'ROLE_ADMIN')")
    public ResponseEntity<ApiResponse<ListingDTO>> updateListing(
            @PathVariable UUID publicId,
            @Valid @RequestBody UpdateListingDTO dto,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        
        log.info("Updating listing: {}", publicId);
        
        ListingDTO updatedListing = listingService.updateListing(publicId, dto, currentUser.getPublicId());
        
        return ResponseEntity.ok(ApiResponse.<ListingDTO>builder()
                .success(true)
                .message("Listing updated successfully")
                .data(updatedListing)
                .build());
    }

    @PatchMapping("/{publicId}/status")
    @PreAuthorize("hasAnyAuthority('ROLE_LANDLORD', 'ROLE_ADMIN')")
    public ResponseEntity<ApiResponse<ListingDTO>> updateListingStatus(
            @PathVariable UUID publicId,
            @RequestParam Listing.ListingStatus status,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        
        log.info("Updating listing status: {} to {}", publicId, status);
        
        ListingDTO updatedListing = listingService.updateListingStatus(publicId, status, currentUser.getPublicId());
        
        return ResponseEntity.ok(ApiResponse.<ListingDTO>builder()
                .success(true)
                .message("Listing status updated successfully")
                .data(updatedListing)
                .build());
    }

    @DeleteMapping("/{publicId}")
    @PreAuthorize("hasAnyAuthority('ROLE_LANDLORD', 'ROLE_ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteListing(
            @PathVariable UUID publicId,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        
        log.info("Deleting listing: {}", publicId);
        
        listingService.deleteListing(publicId, currentUser.getPublicId());
        
        return ResponseEntity.ok(ApiResponse.<Void>builder()
                .success(true)
                .message("Listing deleted successfully")
                .build());
    }
}