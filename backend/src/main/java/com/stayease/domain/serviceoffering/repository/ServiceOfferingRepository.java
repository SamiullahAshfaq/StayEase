package com.stayease.domain.serviceoffering.repository;

import com.stayease.domain.serviceoffering.entity.ServiceOffering;
import com.stayease.domain.serviceoffering.entity.ServiceOffering.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ServiceOfferingRepository extends JpaRepository<ServiceOffering, Long> {

    // Find by public ID
    Optional<ServiceOffering> findByPublicId(String publicId);

    // Find by provider
    Page<ServiceOffering> findByProviderPublicIdOrderByCreatedAtDesc(String providerPublicId, Pageable pageable);

    List<ServiceOffering> findByProviderPublicId(String providerPublicId);

    // Find by category
    Page<ServiceOffering> findByCategoryAndIsActiveTrueAndStatusOrderByCreatedAtDesc(
            ServiceCategory category,
            ServiceStatus status,
            Pageable pageable);

    // Find active services
    Page<ServiceOffering> findByIsActiveTrueAndStatusOrderByAverageRatingDescCreatedAtDesc(
            ServiceStatus status,
            Pageable pageable);

    // Find featured services
    @Query("SELECT s FROM ServiceOffering s WHERE s.isFeatured = true " +
            "AND s.isActive = true AND s.status = 'ACTIVE' " +
            "AND (s.featuredUntil IS NULL OR s.featuredUntil > CURRENT_TIMESTAMP) " +
            "ORDER BY s.averageRating DESC, s.createdAt DESC")
    List<ServiceOffering> findFeaturedServices();

    // Search by location
    @Query("SELECT s FROM ServiceOffering s WHERE s.isActive = true AND s.status = 'ACTIVE' " +
            "AND LOWER(s.city) = LOWER(:city) " +
            "ORDER BY s.averageRating DESC, s.createdAt DESC")
    Page<ServiceOffering> findByCity(@Param("city") String city, Pageable pageable);

    @Query("SELECT s FROM ServiceOffering s WHERE s.isActive = true AND s.status = 'ACTIVE' " +
            "AND LOWER(s.country) = LOWER(:country) " +
            "ORDER BY s.averageRating DESC, s.createdAt DESC")
    Page<ServiceOffering> findByCountry(@Param("country") String country, Pageable pageable);

    // Search by keyword
    @Query("SELECT s FROM ServiceOffering s WHERE s.isActive = true AND s.status = 'ACTIVE' " +
            "AND (LOWER(s.title) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
            "OR LOWER(s.description) LIKE LOWER(CONCAT('%', :keyword, '%'))) " +
            "ORDER BY s.averageRating DESC, s.createdAt DESC")
    Page<ServiceOffering> searchByKeyword(@Param("keyword") String keyword, Pageable pageable);

    // Find by status
    Page<ServiceOffering> findByStatusOrderByCreatedAtDesc(ServiceStatus status, Pageable pageable);

    // Find pending approval
    List<ServiceOffering> findByStatusOrderByCreatedAtAsc(ServiceStatus status);

    // Find by rating
    @Query("SELECT s FROM ServiceOffering s WHERE s.isActive = true AND s.status = 'ACTIVE' " +
            "AND s.averageRating >= :minRating " +
            "ORDER BY s.averageRating DESC, s.totalReviews DESC")
    Page<ServiceOffering> findByMinimumRating(@Param("minRating") Double minRating, Pageable pageable);

    // Count by provider
    long countByProviderPublicId(String providerPublicId);

    // Count by status
    long countByStatus(ServiceStatus status);

    // Count active services
    long countByIsActiveTrueAndStatus(ServiceStatus status);

    // Increment counters
    @Modifying
    @Query("UPDATE ServiceOffering s SET s.viewCount = s.viewCount + 1 WHERE s.publicId = :publicId")
    int incrementViewCount(@Param("publicId") String publicId);

    @Modifying
    @Query("UPDATE ServiceOffering s SET s.favoriteCount = s.favoriteCount + 1 WHERE s.publicId = :publicId")
    int incrementFavoriteCount(@Param("publicId") String publicId);

    @Modifying
    @Query("UPDATE ServiceOffering s SET s.inquiryCount = s.inquiryCount + 1 WHERE s.publicId = :publicId")
    int incrementInquiryCount(@Param("publicId") String publicId);

    // Statistics
    @Query("SELECT s.category, COUNT(s) FROM ServiceOffering s " +
            "WHERE s.isActive = true AND s.status = 'ACTIVE' " +
            "GROUP BY s.category")
    List<Object[]> countByCategory();

    @Query("SELECT s.city, COUNT(s) FROM ServiceOffering s " +
            "WHERE s.isActive = true AND s.status = 'ACTIVE' " +
            "GROUP BY s.city ORDER BY COUNT(s) DESC")
    List<Object[]> countByCity();
}
