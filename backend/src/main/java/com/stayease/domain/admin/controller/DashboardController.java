package com.stayease.domain.admin.controller;

import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.UUID;

import org.springframework.format.annotation.DateTimeFormat;
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
     * Supports date range filtering and user-specific reports
     * 
     * @param startDate Optional start date for filtering (format: yyyy-MM-dd)
     * @param endDate Optional end date for filtering (format: yyyy-MM-dd)
     * @param userPublicId Optional user UUID for user-specific reports
     * @return DashboardStatsDTO containing all platform statistics
     */
    @GetMapping("/stats")
    public ResponseEntity<ApiResponse<DashboardStatsDTO>> getDashboardStats(
            @RequestParam(required = false) @DateTimeFormat(pattern = "yyyy-MM-dd") LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(pattern = "yyyy-MM-dd") LocalDate endDate,
            @RequestParam(required = false) UUID userPublicId) {
        log.info("GET request to fetch dashboard statistics - startDate: {}, endDate: {}, userPublicId: {}", 
                 startDate, endDate, userPublicId);
        
        Instant start = startDate != null ? startDate.atStartOfDay(ZoneId.systemDefault()).toInstant() : null;
        Instant end = endDate != null ? endDate.atTime(23, 59, 59).atZone(ZoneId.systemDefault()).toInstant() : null;
        
        DashboardStatsDTO stats = dashboardService.getDashboardStats(start, end, userPublicId);
        return ResponseEntity.ok(ApiResponse.success(stats, "Dashboard statistics retrieved successfully"));
    }

    /**
     * Get revenue chart data for a specific time period
     * Supports date range filtering and user-specific reports
     * 
     * @param days Number of days to retrieve data for (default: 30)
     * @param startDate Optional start date for filtering (format: yyyy-MM-dd)
     * @param endDate Optional end date for filtering (format: yyyy-MM-dd)
     * @param userPublicId Optional user UUID for user-specific reports
     * @return Revenue chart data including daily revenue, payment methods, and categories
     */
    @GetMapping("/revenue-chart")
    public ResponseEntity<ApiResponse<RevenueChartDTO>> getRevenueChart(
            @RequestParam(defaultValue = "30") int days,
            @RequestParam(required = false) @DateTimeFormat(pattern = "yyyy-MM-dd") LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(pattern = "yyyy-MM-dd") LocalDate endDate,
            @RequestParam(required = false) UUID userPublicId) {
        log.info("GET request to fetch revenue chart - days: {}, startDate: {}, endDate: {}, userPublicId: {}", 
                 days, startDate, endDate, userPublicId);
        
        Instant start = startDate != null ? startDate.atStartOfDay(ZoneId.systemDefault()).toInstant() : null;
        Instant end = endDate != null ? endDate.atTime(23, 59, 59).atZone(ZoneId.systemDefault()).toInstant() : null;
        
        RevenueChartDTO chartData = dashboardService.getRevenueChartData(days, start, end, userPublicId);
        return ResponseEntity.ok(ApiResponse.success(chartData, "Revenue chart data retrieved successfully"));
    }

    /**
     * Get booking chart data for a specific time period
     * Supports date range filtering and user-specific reports
     * 
     * @param days Number of days to retrieve data for (default: 30)
     * @param startDate Optional start date for filtering (format: yyyy-MM-dd)
     * @param endDate Optional end date for filtering (format: yyyy-MM-dd)
     * @param userPublicId Optional user UUID for user-specific reports
     * @return Booking chart data including trends and status breakdown
     */
    @GetMapping("/booking-chart")
    public ResponseEntity<ApiResponse<BookingChartDTO>> getBookingChart(
            @RequestParam(defaultValue = "30") int days,
            @RequestParam(required = false) @DateTimeFormat(pattern = "yyyy-MM-dd") LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(pattern = "yyyy-MM-dd") LocalDate endDate,
            @RequestParam(required = false) UUID userPublicId) {
        log.info("GET request to fetch booking chart - days: {}, startDate: {}, endDate: {}, userPublicId: {}", 
                 days, startDate, endDate, userPublicId);
        
        Instant start = startDate != null ? startDate.atStartOfDay(ZoneId.systemDefault()).toInstant() : null;
        Instant end = endDate != null ? endDate.atTime(23, 59, 59).atZone(ZoneId.systemDefault()).toInstant() : null;
        
        BookingChartDTO chartData = dashboardService.getBookingChartData(days, start, end, userPublicId);
        return ResponseEntity.ok(ApiResponse.success(chartData, "Booking chart data retrieved successfully"));
    }

    /**
     * Get user growth chart data for a specific time period
     * Supports date range filtering
     * 
     * @param days Number of days to retrieve data for (default: 30)
     * @param startDate Optional start date for filtering (format: yyyy-MM-dd)
     * @param endDate Optional end date for filtering (format: yyyy-MM-dd)
     * @return User chart data including growth trends and role distribution
     */
    @GetMapping("/user-chart")
    public ResponseEntity<ApiResponse<UserChartDTO>> getUserChart(
            @RequestParam(defaultValue = "30") int days,
            @RequestParam(required = false) @DateTimeFormat(pattern = "yyyy-MM-dd") LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(pattern = "yyyy-MM-dd") LocalDate endDate) {
        log.info("GET request to fetch user chart - days: {}, startDate: {}, endDate: {}", 
                 days, startDate, endDate);
        
        Instant start = startDate != null ? startDate.atStartOfDay(ZoneId.systemDefault()).toInstant() : null;
        Instant end = endDate != null ? endDate.atTime(23, 59, 59).atZone(ZoneId.systemDefault()).toInstant() : null;
        
        UserChartDTO chartData = dashboardService.getUserChartData(days, start, end);
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
