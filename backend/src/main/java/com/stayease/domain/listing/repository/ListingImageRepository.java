package com.stayease.domain.listing.repository;

import com.stayease.domain.listing.entity.ListingImage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ListingImageRepository extends JpaRepository<ListingImage, Long> {
    
    List<ListingImage> findByListingIdOrderBySortOrderAsc(Long listingId);
    
    @Query("SELECT li FROM ListingImage li WHERE li.listing.id = :listingId AND li.isCover = true")
    Optional<ListingImage> findCoverImageByListingId(@Param("listingId") Long listingId);
    
    void deleteByListingId(Long listingId);
    
    @Query("SELECT COUNT(li) FROM ListingImage li WHERE li.listing.id = :listingId")
    Long countByListingId(@Param("listingId") Long listingId);
}