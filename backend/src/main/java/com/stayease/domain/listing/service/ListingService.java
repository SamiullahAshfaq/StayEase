package com.stayease.domain.listing.service;

import com.stayease.domain.listing.dto.CreateListingDTO;
import com.stayease.domain.listing.dto.ListingDTO;
import com.stayease.domain.listing.dto.SearchListingDTO;
import com.stayease.domain.listing.dto.UpdateListingDTO;
import com.stayease.domain.listing.entity.Listing;
import com.stayease.domain.listing.entity.ListingImage;
import com.stayease.domain.listing.repository.ListingRepository;
import com.stayease.exception.ForbiddenException;
import com.stayease.exception.NotFoundException;
import com.stayease.security.SecurityUtils;
import com.stayease.shared.mapper.ListingMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class ListingService {

    private final ListingRepository listingRepository;
    private final ListingMapper listingMapper;

    public ListingDTO createListing(CreateListingDTO createListingDTO) {
        UUID landlordPublicId = SecurityUtils.getCurrentUserPublicId()
                .orElseThrow(() -> new ForbiddenException("User must be authenticated"));

        log.info("Creating new listing for landlord: {}", landlordPublicId);

        Listing listing = listingMapper.toEntity(createListingDTO);
        listing.setLandlordPublicId(landlordPublicId);

        // Add images if provided
        if (createListingDTO.getImageUrls() != null && !createListingDTO.getImageUrls().isEmpty()) {
            for (int i = 0; i < createListingDTO.getImageUrls().size(); i++) {
                ListingImage image = listingMapper.imageToEntity(createListingDTO.getImageUrls().get(i), i);
                listing.addImage(image);
            }
        }

        Listing savedListing = listingRepository.save(listing);
        log.info("Listing created successfully with publicId: {}", savedListing.getPublicId());

        return listingMapper.toDTO(savedListing);
    }

    @Transactional(readOnly = true)
    public ListingDTO getListingByPublicId(UUID publicId) {
        log.info("Fetching listing with publicId: {}", publicId);
        Listing listing = listingRepository.findByPublicIdWithImages(publicId)
                .orElseThrow(() -> new NotFoundException("Listing not found with publicId: " + publicId));
        return listingMapper.toDTO(listing);
    }

    @Transactional(readOnly = true)
    public Page<ListingDTO> getAllListings(int page, int size, String sortBy, String sortDirection) {
        log.info("Fetching all listings - page: {}, size: {}", page, size);
        
        Sort.Direction direction = sortDirection.equalsIgnoreCase("ASC") ? Sort.Direction.ASC : Sort.Direction.DESC;
        Pageable pageable = PageRequest.of(page, size, Sort.by(direction, sortBy));
        
        return listingRepository.findAll(pageable)
                .map(listingMapper::toDTO);
    }

    @Transactional(readOnly = true)
    public Page<ListingDTO> searchListings(SearchListingDTO searchDTO) {
        log.info("Searching listings with criteria: {}", searchDTO);
        
        Sort.Direction direction = searchDTO.getSortDirection().equalsIgnoreCase("ASC") ? 
                Sort.Direction.ASC : Sort.Direction.DESC;
        Pageable pageable = PageRequest.of(
                searchDTO.getPage(), 
                searchDTO.getSize(), 
                Sort.by(direction, searchDTO.getSortBy())
        );
        
        return listingRepository.searchListings(
                searchDTO.getLocation(),
                searchDTO.getCategory(),
                searchDTO.getMinPrice(),
                searchDTO.getMaxPrice(),
                searchDTO.getGuests(),
                pageable
        ).map(listingMapper::toDTO);
    }

    @Transactional(readOnly = true)
    public Page<ListingDTO> getMyListings(int page, int size) {
        UUID landlordPublicId = SecurityUtils.getCurrentUserPublicId()
                .orElseThrow(() -> new ForbiddenException("User must be authenticated"));

        log.info("Fetching listings for landlord: {}", landlordPublicId);
        
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        return listingRepository.findByLandlordPublicId(landlordPublicId, pageable)
                .map(listingMapper::toDTO);
    }

    public ListingDTO updateListing(UUID publicId, UpdateListingDTO updateListingDTO) {
        log.info("Updating listing with publicId: {}", publicId);

        Listing listing = listingRepository.findByPublicIdWithImages(publicId)
                .orElseThrow(() -> new NotFoundException("Listing not found with publicId: " + publicId));

        // Check if user is the landlord
        UUID currentUserPublicId = SecurityUtils.getCurrentUserPublicId()
                .orElseThrow(() -> new ForbiddenException("User must be authenticated"));
        
        if (!listing.getLandlordPublicId().equals(currentUserPublicId) && 
            !SecurityUtils.hasAuthority("ROLE_ADMIN")) {
            throw new ForbiddenException("You don't have permission to update this listing");
        }

        // Update fields if provided
        if (updateListingDTO.getTitle() != null) listing.setTitle(updateListingDTO.getTitle());
        if (updateListingDTO.getDescription() != null) listing.setDescription(updateListingDTO.getDescription());
        if (updateListingDTO.getLocation() != null) listing.setLocation(updateListingDTO.getLocation());
        if (updateListingDTO.getPrice() != null) listing.setPrice(updateListingDTO.getPrice());
        if (updateListingDTO.getGuests() != null) listing.setGuests(updateListingDTO.getGuests());
        if (updateListingDTO.getBedrooms() != null) listing.setBedrooms(updateListingDTO.getBedrooms());
        if (updateListingDTO.getBeds() != null) listing.setBeds(updateListingDTO.getBeds());
        if (updateListingDTO.getBathrooms() != null) listing.setBathrooms(updateListingDTO.getBathrooms());
        if (updateListingDTO.getCategory() != null) listing.setCategory(updateListingDTO.getCategory());
        if (updateListingDTO.getRules() != null) listing.setRules(updateListingDTO.getRules());

        // Update images if provided
        if (updateListingDTO.getImageUrls() != null) {
            listing.getImages().clear();
            for (int i = 0; i < updateListingDTO.getImageUrls().size(); i++) {
                ListingImage image = listingMapper.imageToEntity(updateListingDTO.getImageUrls().get(i), i);
                listing.addImage(image);
            }
        }

        Listing updatedListing = listingRepository.save(listing);
        log.info("Listing updated successfully with publicId: {}", publicId);

        return listingMapper.toDTO(updatedListing);
    }

    public void deleteListing(UUID publicId) {
        log.info("Deleting listing with publicId: {}", publicId);

        Listing listing = listingRepository.findByPublicId(publicId)
                .orElseThrow(() -> new NotFoundException("Listing not found with publicId: " + publicId));

        // Check if user is the landlord
        UUID currentUserPublicId = SecurityUtils.getCurrentUserPublicId()
                .orElseThrow(() -> new ForbiddenException("User must be authenticated"));
        
        if (!listing.getLandlordPublicId().equals(currentUserPublicId) && 
            !SecurityUtils.hasAuthority("ROLE_ADMIN")) {
            throw new ForbiddenException("You don't have permission to delete this listing");
        }

        listingRepository.delete(listing);
        log.info("Listing deleted successfully with publicId: {}", publicId);
    }

    @Transactional(readOnly = true)
    public List<String> getAllCategories() {
        log.info("Fetching all listing categories");
        return listingRepository.findAllCategories();
    }
}