package com.stayease.domain.admin.dto;

import java.math.BigDecimal;
import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ListingChartDTO {
    private List<ListingDistribution> listingsByLocation;
    private List<ListingByType> listingsByType;
    private List<OccupancyData> occupancyRates;
    private List<TopListing> topPerformingListings;
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ListingDistribution {
        private String location;
        private String city;
        private String country;
        private Long count;
        private Double percentage;
    }
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ListingByType {
        private String propertyType;
        private Long count;
        private Double percentage;
        private BigDecimal averagePrice;
    }
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class OccupancyData {
        private String listingId;
        private String listingTitle;
        private Double occupancyRate;
        private Long totalBookings;
    }
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TopListing {
        private String listingId;
        private String title;
        private String landlordName;
        private Long bookingCount;
        private BigDecimal totalRevenue;
        private Double averageRating;
    }
}
