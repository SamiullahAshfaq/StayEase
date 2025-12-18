package com.stayease.domain.listing.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.stayease.domain.listing.entity.Favorite;

@Repository
public interface FavoriteRepository extends JpaRepository<Favorite, Long> {

    @Query("SELECT f FROM Favorite f WHERE f.user.publicId = :userPublicId AND f.listing.publicId = :listingPublicId")
    Optional<Favorite> findByUserPublicIdAndListingPublicId(@Param("userPublicId") UUID userPublicId, @Param("listingPublicId") UUID listingPublicId);

    @Query("SELECT f FROM Favorite f JOIN FETCH f.listing l LEFT JOIN FETCH l.images WHERE f.user.publicId = :userPublicId ORDER BY f.createdAt DESC")
    List<Favorite> findAllByUserPublicId(@Param("userPublicId") UUID userPublicId);

    @Query("SELECT COUNT(f) FROM Favorite f WHERE f.user.publicId = :userPublicId AND f.listing.publicId = :listingPublicId")
    long countByUserPublicIdAndListingPublicId(@Param("userPublicId") UUID userPublicId, @Param("listingPublicId") UUID listingPublicId);

    @Modifying
    @Query("DELETE FROM Favorite f WHERE f.user.publicId = :userPublicId AND f.listing.publicId = :listingPublicId")
    void deleteByUserPublicIdAndListingPublicId(@Param("userPublicId") UUID userPublicId, @Param("listingPublicId") UUID listingPublicId);
}
