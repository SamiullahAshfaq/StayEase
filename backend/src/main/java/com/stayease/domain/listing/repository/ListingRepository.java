package com.stayease.domain.listing.repository;

import com.stayease.domain.listing.entity.Listing;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ListingRepository extends JpaRepository<Listing, Long> {

    Optional<Listing> findByPublicId(UUID publicId);

    @Query("SELECT l FROM Listing l LEFT JOIN FETCH l.images WHERE l.publicId = :publicId")
    Optional<Listing> findByPublicIdWithImages(@Param("publicId") UUID publicId);

    @Query("SELECT l FROM Listing l WHERE l.landlordPublicId = :landlordPublicId")
    Page<Listing> findByLandlordPublicId(@Param("landlordPublicId") UUID landlordPublicId, Pageable pageable);

    @Query("SELECT l FROM Listing l WHERE " +
           "(:location IS NULL OR LOWER(l.location) LIKE LOWER(CONCAT('%', :location, '%'))) AND " +
           "(:category IS NULL OR l.category = :category) AND " +
           "(:minPrice IS NULL OR l.price >= :minPrice) AND " +
           "(:maxPrice IS NULL OR l.price <= :maxPrice) AND " +
           "(:guests IS NULL OR l.guests >= :guests)")
    Page<Listing> searchListings(
            @Param("location") String location,
            @Param("category") String category,
            @Param("minPrice") BigDecimal minPrice,
            @Param("maxPrice") BigDecimal maxPrice,
            @Param("guests") Integer guests,
            Pageable pageable);

    @Query("SELECT DISTINCT l.category FROM Listing l ORDER BY l.category")
    List<String> findAllCategories();
}