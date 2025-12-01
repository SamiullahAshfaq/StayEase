package com.stayease.domain.listing.controller;

import com.stayease.domain.listing.dto.CreateListingDTO;
import com.stayease.domain.listing.dto.ListingDTO;
import com.stayease.domain.listing.dto.SearchListingDTO;
import com.stayease.domain.listing.dto.UpdateListingDTO;
import com.stayease.domain.listing.service.ListingService;
import com.stayease.shared.dto.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/listings")
@RequiredArgsConstructor
public class ListingController {

    private final ListingService listingService;

    @PostMapping
    @PreAuthorize("hasAnyRole('LANDLORD', 'ADMIN')")
    public ResponseEntity<ApiResponse<ListingDTO>> createListing(@Valid @RequestBody CreateListingDTO createListingDTO) {
        ListingDTO listing = listingService.createListing(createListingDTO);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(listing, "Listing created successfully"));
    }

    @GetMapping("/{publicId}")
    public ResponseEntity<ApiResponse<ListingDTO>> getListingByPublicId(@PathVariable UUID publicId) {
        ListingDTO listing = listingService.getListingByPublicId(publicId);
        return ResponseEntity.ok(ApiResponse.success(listing, "Listing retrieved successfully"));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<Page<ListingDTO>>> getAllListings(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "DESC") String sortDirection) {
        Page<ListingDTO> listings = listingService.getAllListings(page, size, sortBy, sortDirection);
        return ResponseEntity.ok(ApiResponse.success(listings, "Listings retrieved successfully"));
    }

    @PostMapping("/search")
    public ResponseEntity<ApiResponse<Page<ListingDTO>>> searchListings(@RequestBody SearchListingDTO searchDTO) {
        Page<ListingDTO> listings = listingService.searchListings(searchDTO);
        return ResponseEntity.ok(ApiResponse.success(listings, "Search completed successfully"));
    }

    @GetMapping("/my-listings")
    @PreAuthorize("hasAnyRole('LANDLORD', 'ADMIN')")
    public ResponseEntity<ApiResponse<Page<ListingDTO>>> getMyListings(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Page<ListingDTO> listings = listingService.getMyListings(page, size);
        return ResponseEntity.ok(ApiResponse.success(listings, "Your listings retrieved successfully"));
    }

    @PutMapping("/{publicId}")
    @PreAuthorize("hasAnyRole('LANDLORD', 'ADMIN')")
    public ResponseEntity<ApiResponse<ListingDTO>> updateListing(
            @PathVariable UUID publicId,
            @Valid @RequestBody UpdateListingDTO updateListingDTO) {
        ListingDTO listing = listingService.updateListing(publicId, updateListingDTO);
        return ResponseEntity.ok(ApiResponse.success(listing, "Listing updated successfully"));
    }

    @DeleteMapping("/{publicId}")
    @PreAuthorize("hasAnyRole('LANDLORD', 'ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteListing(@PathVariable UUID publicId) {
        listingService.deleteListing(publicId);
        return ResponseEntity.ok(ApiResponse.success(null, "Listing deleted successfully"));
    }

    @GetMapping("/categories")
    public ResponseEntity<ApiResponse<List<String>>> getAllCategories() {
        List<String> categories = listingService.getAllCategories();
        return ResponseEntity.ok(ApiResponse.success(categories, "Categories retrieved successfully"));
    }
}