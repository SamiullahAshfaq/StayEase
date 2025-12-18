package com.stayease.domain.listing.controller;

import com.stayease.domain.listing.dto.ListingDTO;
import com.stayease.domain.listing.service.FavoriteService;
import com.stayease.security.UserPrincipal;
import com.stayease.shared.dto.ApiResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/favorites")
@RequiredArgsConstructor
@Slf4j
public class FavoriteController {

    private final FavoriteService favoriteService;

    @PostMapping("/{listingId}")
    public ResponseEntity<ApiResponse<Void>> addToFavorites(
            @PathVariable UUID listingId,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        
        log.info("Adding listing {} to favorites for user: {}", listingId, currentUser.getId());
        
        favoriteService.addToFavorites(currentUser.getId(), listingId);
        
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(null, "Listing added to favorites"));
    }

    @DeleteMapping("/{listingId}")
    public ResponseEntity<ApiResponse<Void>> removeFromFavorites(
            @PathVariable UUID listingId,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        
        log.info("Removing listing {} from favorites for user: {}", listingId, currentUser.getId());
        
        favoriteService.removeFromFavorites(currentUser.getId(), listingId);
        
        return ResponseEntity.ok(ApiResponse.success(null, "Listing removed from favorites"));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<ListingDTO>>> getUserFavorites(
            @AuthenticationPrincipal UserPrincipal currentUser) {
        
        log.info("Fetching favorites for user: {}", currentUser.getId());
        
        List<ListingDTO> favorites = favoriteService.getUserFavorites(currentUser.getId());
        
        return ResponseEntity.ok(ApiResponse.success(favorites, "Favorites retrieved successfully"));
    }

    @GetMapping("/{listingId}/status")
    public ResponseEntity<ApiResponse<Boolean>> isFavorite(
            @PathVariable UUID listingId,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        
        boolean isFavorite = favoriteService.isFavorite(currentUser.getId(), listingId);
        
        return ResponseEntity.ok(ApiResponse.success(isFavorite, "Favorite status retrieved"));
    }
}
