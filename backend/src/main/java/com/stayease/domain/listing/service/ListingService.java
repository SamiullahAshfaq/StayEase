package com.stayease.domain.listing.service;

import com.stayease.domain.listing.dto.*;
import com.stayease.domain.listing.entity.Listing;
import com.stayease.domain.listing.repository.ListingImageRepository;
import com.stayease.domain.listing.repository.ListingRepository;
import com.stayease.exception.ForbiddenException;
import com.stayease.exception.NotFoundException;
import com.stayease.shared.mapper.ListingMapper;
import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class ListingService {

    private final ListingRepository listingRepository;
    private final ListingImageRepository listingImageRepository;
    private final ListingMapper listingMapper;

    public ListingDTO createListing(CreateListingDTO dto, UUID landlordPublicId) {
        log.info("Creating new listing for landlord: {}", landlordPublicId);

        Listing listing = listingMapper.toEntity(dto);
        listing.setLandlordPublicId(landlordPublicId);
        
        Listing savedListing = listingRepository.save(listing);
        log.info("Listing created successfully with ID: {}", savedListing.getPublicId());
        
        return listingMapper.toDTO(savedListing);
    }

    @Transactional(readOnly = true)
    public ListingDTO getListingByPublicId(UUID publicId) {
        log.debug("Fetching listing with publicId: {}", publicId);
        
        Listing listing = listingRepository.findByPublicIdWithImages(publicId)
                .orElseThrow(() -> new NotFoundException("Listing not found with ID: " + publicId));
        
        return listingMapper.toDTO(listing);
    }

    @Transactional(readOnly = true)
    public Page<ListingDTO> getAllListings(int page, int size, String sortBy, String sortDirection) {
        log.debug("Fetching all active listings - page: {}, size: {}", page, size);
        
        Sort sort = sortDirection.equalsIgnoreCase("ASC") ? 
                Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
        
        Pageable pageable = PageRequest.of(page, size, sort);
        
        Page<Listing> listings = listingRepository.findAll(
                (Specification<Listing>) (root, query, cb) -> 
                        cb.equal(root.get("status"), Listing.ListingStatus.ACTIVE),
                pageable
        );
        
        return listings.map(listingMapper::toDTO);
    }

    @Transactional(readOnly = true)
    public Page<ListingDTO> searchListings(SearchListingDTO searchDTO) {
        log.debug("Searching listings with criteria: {}", searchDTO);
        
        Sort sort = searchDTO.getSortDirection().equalsIgnoreCase("ASC") ? 
                Sort.by(searchDTO.getSortBy()).ascending() : 
                Sort.by(searchDTO.getSortBy()).descending();
        
        Pageable pageable = PageRequest.of(searchDTO.getPage(), searchDTO.getSize(), sort);
        
        Specification<Listing> spec = createSpecification(searchDTO);
        
        Page<Listing> listings = listingRepository.findAll(spec, pageable);
        
        return listings.map(listingMapper::toDTO);
    }

    @Transactional(readOnly = true)
    public List<ListingDTO> getListingsByLandlord(UUID landlordPublicId) {
        log.debug("Fetching listings for landlord: {}", landlordPublicId);
        
        List<Listing> listings = listingRepository.findByLandlordPublicId(landlordPublicId);
        
        return listingMapper.toDTOList(listings);
    }

    @Transactional(readOnly = true)
    public Page<ListingDTO> getListingsByCategory(String category, int page, int size) {
        log.debug("Fetching listings by category: {}", category);
        
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        
        Page<Listing> listings = listingRepository.findByCategory(category, pageable);
        
        return listings.map(listingMapper::toDTO);
    }

    public ListingDTO updateListing(UUID publicId, UpdateListingDTO dto, UUID currentUserPublicId) {
        log.info("Updating listing: {}", publicId);
        
        Listing listing = listingRepository.findByPublicId(publicId)
                .orElseThrow(() -> new NotFoundException("Listing not found with ID: " + publicId));
        
        if (!listing.getLandlordPublicId().equals(currentUserPublicId)) {
            throw new ForbiddenException("You don't have permission to update this listing");
        }
        
        listingMapper.updateEntity(listing, dto);
        
        Listing updatedListing = listingRepository.save(listing);
        log.info("Listing updated successfully: {}", publicId);
        
        return listingMapper.toDTO(updatedListing);
    }

    public void deleteListing(UUID publicId, UUID currentUserPublicId) {
        log.info("Deleting listing: {}", publicId);
        
        Listing listing = listingRepository.findByPublicId(publicId)
                .orElseThrow(() -> new NotFoundException("Listing not found with ID: " + publicId));
        
        if (!listing.getLandlordPublicId().equals(currentUserPublicId)) {
            throw new ForbiddenException("You don't have permission to delete this listing");
        }
        
        listingRepository.delete(listing);
        log.info("Listing deleted successfully: {}", publicId);
    }

    public ListingDTO updateListingStatus(UUID publicId, Listing.ListingStatus status, UUID currentUserPublicId) {
        log.info("Updating listing status: {} to {}", publicId, status);
        
        Listing listing = listingRepository.findByPublicId(publicId)
                .orElseThrow(() -> new NotFoundException("Listing not found with ID: " + publicId));
        
        if (!listing.getLandlordPublicId().equals(currentUserPublicId)) {
            throw new ForbiddenException("You don't have permission to update this listing");
        }
        
        listing.setStatus(status);
        Listing updatedListing = listingRepository.save(listing);
        
        return listingMapper.toDTO(updatedListing);
    }

    private Specification<Listing> createSpecification(SearchListingDTO searchDTO) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            
            // Always filter active listings
            predicates.add(cb.equal(root.get("status"), Listing.ListingStatus.ACTIVE));
            
            // Location filters
            if (searchDTO.getLocation() != null && !searchDTO.getLocation().isEmpty()) {
                String locationPattern = "%" + searchDTO.getLocation().toLowerCase() + "%";
                predicates.add(cb.or(
                    cb.like(cb.lower(root.get("location")), locationPattern),
                    cb.like(cb.lower(root.get("city")), locationPattern),
                    cb.like(cb.lower(root.get("country")), locationPattern)
                ));
            }
            
            if (searchDTO.getCity() != null && !searchDTO.getCity().isEmpty()) {
                predicates.add(cb.like(cb.lower(root.get("city")), 
                    "%" + searchDTO.getCity().toLowerCase() + "%"));
            }
            
            if (searchDTO.getCountry() != null && !searchDTO.getCountry().isEmpty()) {
                predicates.add(cb.like(cb.lower(root.get("country")), 
                    "%" + searchDTO.getCountry().toLowerCase() + "%"));
            }
            
            // Guest count
            if (searchDTO.getGuests() != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("maxGuests"), searchDTO.getGuests()));
            }
            
            // Price range
            if (searchDTO.getMinPrice() != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("pricePerNight"), searchDTO.getMinPrice()));
            }
            
            if (searchDTO.getMaxPrice() != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("pricePerNight"), searchDTO.getMaxPrice()));
            }
            
            // Property types
            if (searchDTO.getPropertyTypes() != null && !searchDTO.getPropertyTypes().isEmpty()) {
                predicates.add(root.get("propertyType").in(searchDTO.getPropertyTypes()));
            }
            
            // Categories
            if (searchDTO.getCategories() != null && !searchDTO.getCategories().isEmpty()) {
                predicates.add(root.get("category").in(searchDTO.getCategories()));
            }
            
            // Bedrooms
            if (searchDTO.getMinBedrooms() != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("bedrooms"), searchDTO.getMinBedrooms()));
            }
            
            // Beds
            if (searchDTO.getMinBeds() != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("beds"), searchDTO.getMinBeds()));
            }
            
            // Bathrooms
            if (searchDTO.getMinBathrooms() != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("bathrooms"), searchDTO.getMinBathrooms()));
            }
            
            // Instant book
            if (searchDTO.getInstantBook() != null && searchDTO.getInstantBook()) {
                predicates.add(cb.isTrue(root.get("instantBook")));
            }
            
            // Amenities - check if listing has all requested amenities
            if (searchDTO.getAmenities() != null && !searchDTO.getAmenities().isEmpty()) {
                for (String amenity : searchDTO.getAmenities()) {
                    predicates.add(cb.isTrue(cb.function(
                        "jsonb_exists",
                        Boolean.class,
                        root.get("amenities"),
                        cb.literal(amenity)
                    )));
                }
            }
            return cb.and(predicates.toArray(Predicate[]::new));
        };
    }
}