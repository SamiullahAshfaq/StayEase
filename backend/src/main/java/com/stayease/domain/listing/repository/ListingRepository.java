package com.stayease.domain.listing.repository;

import com.stayease.domain.listing.entity.Listing;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ListingRepository extends JpaRepository<Listing, Long>, JpaSpecificationExecutor<Listing> {
    
    Optional<Listing> findByPublicId(UUID publicId);
    
    List<Listing> findByLandlordPublicId(UUID landlordPublicId);
    
    Page<Listing> findByLandlordPublicId(UUID landlordPublicId, Pageable pageable);
    
    @Query("SELECT l FROM Listing l LEFT JOIN FETCH l.images WHERE l.publicId = :publicId")
    Optional<Listing> findByPublicIdWithImages(@Param("publicId") UUID publicId);
    
    @Query("SELECT l FROM Listing l WHERE l.status = 'ACTIVE' AND " +
           "(:city IS NULL OR LOWER(l.city) LIKE LOWER(CONCAT('%', :city, '%'))) AND " +
           "(:country IS NULL OR LOWER(l.country) LIKE LOWER(CONCAT('%', :country, '%')))")
    Page<Listing> searchByLocation(@Param("city") String city, 
                                    @Param("country") String country, 
                                    Pageable pageable);
    
    @Query("SELECT l FROM Listing l WHERE l.status = 'ACTIVE' AND l.category = :category")
    Page<Listing> findByCategory(@Param("category") String category, Pageable pageable);
    
    @Query("SELECT COUNT(l) FROM Listing l WHERE l.landlordPublicId = :landlordPublicId")
    Long countByLandlord(@Param("landlordPublicId") UUID landlordPublicId);
    
    @Query("SELECT l FROM Listing l WHERE l.status = 'ACTIVE' AND " +
           "l.pricePerNight BETWEEN :minPrice AND :maxPrice")
    Page<Listing> findByPriceRange(@Param("minPrice") java.math.BigDecimal minPrice,
                                    @Param("maxPrice") java.math.BigDecimal maxPrice,
                                    Pageable pageable);
    
    boolean existsByPublicId(UUID publicId);
}