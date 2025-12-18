package com.stayease.domain.listing.service;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.stayease.domain.listing.dto.ListingDTO;
import com.stayease.domain.listing.entity.Favorite;
import com.stayease.domain.listing.entity.Listing;
import com.stayease.domain.listing.repository.FavoriteRepository;
import com.stayease.domain.listing.repository.ListingRepository;
import com.stayease.domain.user.entity.User;
import com.stayease.domain.user.repository.UserRepository;
import com.stayease.exception.NotFoundException;
import com.stayease.shared.mapper.ListingMapper;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class FavoriteService {

    private final FavoriteRepository favoriteRepository;
    private final UserRepository userRepository;
    private final ListingRepository listingRepository;
    private final ListingMapper listingMapper;

    @Transactional
    public void addToFavorites(UUID userPublicId, UUID listingPublicId) {
        // Check if already exists
        if (favoriteRepository.countByUserPublicIdAndListingPublicId(userPublicId, listingPublicId) > 0) {
            return; // Already favorited
        }

        User user = userRepository.findByPublicId(userPublicId)
            .orElseThrow(() -> new NotFoundException("User not found with id: " + userPublicId));

        Listing listing = listingRepository.findByPublicId(listingPublicId)
            .orElseThrow(() -> new NotFoundException("Listing not found with id: " + listingPublicId));

        Favorite favorite = Favorite.builder()
            .user(user)
            .listing(listing)
            .build();

        favoriteRepository.save(favorite);
    }

    @Transactional
    public void removeFromFavorites(UUID userPublicId, UUID listingPublicId) {
        favoriteRepository.deleteByUserPublicIdAndListingPublicId(userPublicId, listingPublicId);
    }

    @Transactional(readOnly = true)
    public List<ListingDTO> getUserFavorites(UUID userPublicId) {
        List<Favorite> favorites = favoriteRepository.findAllByUserPublicId(userPublicId);
        
        return favorites.stream()
            .map(favorite -> listingMapper.toDTO(favorite.getListing()))
            .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public boolean isFavorite(UUID userPublicId, UUID listingPublicId) {
        return favoriteRepository.countByUserPublicIdAndListingPublicId(userPublicId, listingPublicId) > 0;
    }
}
