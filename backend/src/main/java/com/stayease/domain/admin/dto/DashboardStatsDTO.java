package com.stayease.domain.admin.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardStatsDTO {
    
    // Revenue Statistics
    private RevenueStats revenueStats;
    
    // Booking Statistics
    private BookingStats bookingStats;
    
    // User Statistics
    private UserStats userStats;
    
    // Listing Statistics
    private ListingStats listingStats;
    
    // Recent Activities
    private RecentActivityStats recentActivity;
    
    private LocalDateTime generatedAt;
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RevenueStats {
        private BigDecimal totalRevenue;
        private BigDecimal todayRevenue;
        private BigDecimal weekRevenue;
        private BigDecimal monthRevenue;
        private BigDecimal yearRevenue;
        private BigDecimal averageBookingValue;
        private BigDecimal pendingPayments;
        private BigDecimal completedPayments;
        private Double revenueGrowthPercentage;
        private Integer totalTransactions;
    }
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class BookingStats {
        private Long totalBookings;
        private Long activeBookings;
        private Long completedBookings;
        private Long cancelledBookings;
        private Long pendingBookings;
        private Long todayBookings;
        private Long weekBookings;
        private Long monthBookings;
        private Double cancellationRate;
        private Double occupancyRate;
        private BigDecimal averageStayDuration;
    }
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UserStats {
        private Long totalUsers;
        private Long totalTenants;
        private Long totalLandlords;
        private Long totalAdmins;
        private Long activeUsers;
        private Long inactiveUsers;
        private Long todayRegistrations;
        private Long weekRegistrations;
        private Long monthRegistrations;
        private Long verifiedUsers;
        private Double userGrowthPercentage;
    }
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ListingStats {
        private Long totalListings;
        private Long activeListings;
        private Long pendingApproval;
        private Long rejectedListings;
        private Long featuredListings;
        private Long todayListings;
        private Long weekListings;
        private Long monthListings;
        private Double averageRating;
        private Double averageOccupancyRate;
    }
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RecentActivityStats {
        private Long recentLogins;
        private Long recentBookings;
        private Long recentCancellations;
        private Long recentPayments;
        private Long pendingApprovals;
        private Long recentReviews;
    }
}
