package com.stayease.domain.admin.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.stayease.domain.admin.dto.BookingChartDTO;
import com.stayease.domain.admin.dto.DashboardStatsDTO;
import com.stayease.domain.admin.dto.ListingChartDTO;
import com.stayease.domain.admin.dto.RevenueChartDTO;
import com.stayease.domain.admin.dto.UserChartDTO;
import com.stayease.domain.admin.service.DashboardStatisticsService;
import com.stayease.shared.dto.ApiResponse;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * Admin Dashboard Controller
 * Provides comprehensive statistics, charts, and analytics for platform admins
 */
@RestController
@RequestMapping("/api/admin/dashboard")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
@Slf4j
public class DashboardController {

    private final DashboardStatisticsService dashboardService;

    /**
     * Get comprehensive dashboard statistics including revenue, bookings, users, and listings
     * 
     * @return DashboardStatsDTO containing all platform statistics
     */
    @GetMapping("/stats")
    public ResponseEntity<ApiResponse<DashboardStatsDTO>> getDashboardStats() {
        log.info("GET request to fetch dashboard statistics");
        DashboardStatsDTO stats = dashboardService.getDashboardStats();
        return ResponseEntity.ok(ApiResponse.success(stats, "Dashboard statistics retrieved successfully"));
    }

    /**
     * Get revenue chart data for a specific time period
     * 
     * @param days Number of days to retrieve data for (default: 30)
     * @return Revenue chart data including daily revenue, payment methods, and categories
     */
    @GetMapping("/revenue-chart")
    public ResponseEntity<ApiResponse<RevenueChartDTO>> getRevenueChart(
            @RequestParam(defaultValue = "30") int days) {
        log.info("GET request to fetch revenue chart for {} days", days);
        RevenueChartDTO chartData = dashboardService.getRevenueChartData(days);
        return ResponseEntity.ok(ApiResponse.success(chartData, "Revenue chart data retrieved successfully"));
    }

    /**
     * Get booking chart data for a specific time period
     * 
     * @param days Number of days to retrieve data for (default: 30)
     * @return Booking chart data including trends and status breakdown
     */
    @GetMapping("/booking-chart")
    public ResponseEntity<ApiResponse<BookingChartDTO>> getBookingChart(
            @RequestParam(defaultValue = "30") int days) {
        log.info("GET request to fetch booking chart for {} days", days);
        BookingChartDTO chartData = dashboardService.getBookingChartData(days);
        return ResponseEntity.ok(ApiResponse.success(chartData, "Booking chart data retrieved successfully"));
    }

    /**
     * Get user growth chart data for a specific time period
     * 
     * @param days Number of days to retrieve data for (default: 30)
     * @return User chart data including growth trends and role distribution
     */
    @GetMapping("/user-chart")
    public ResponseEntity<ApiResponse<UserChartDTO>> getUserChart(
            @RequestParam(defaultValue = "30") int days) {
        log.info("GET request to fetch user chart for {} days", days);
        UserChartDTO chartData = dashboardService.getUserChartData(days);
        return ResponseEntity.ok(ApiResponse.success(chartData, "User chart data retrieved successfully"));
    }

    /**
     * Get listing statistics and distribution chart data
     * 
     * @return Listing chart data including status distribution and category breakdown
     */
    @GetMapping("/listing-chart")
    public ResponseEntity<ApiResponse<ListingChartDTO>> getListingChart() {
        log.info("GET request to fetch listing chart");
        ListingChartDTO chartData = dashboardService.getListingChartData();
        return ResponseEntity.ok(ApiResponse.success(chartData, "Listing chart data retrieved successfully"));
    }

    /**
     * Get recent activity summary for the dashboard
     * 
     * @return Recent activity metrics
     */
    @GetMapping("/recent-activity")
    public ResponseEntity<ApiResponse<Object>> getRecentActivity() {
        log.info("GET request to fetch recent activity");
        // Included in main stats for now
        DashboardStatsDTO stats = dashboardService.getDashboardStats();
        return ResponseEntity.ok(ApiResponse.success(stats.getRecentActivity(), "Recent activity retrieved successfully"));
    }
}
