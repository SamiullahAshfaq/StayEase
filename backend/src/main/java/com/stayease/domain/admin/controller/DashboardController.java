// package com.stayease.domain.admin.controller;

// import com.stayease.domain.admin.dto.*;
// import com.stayease.domain.admin.service.DashboardStatisticsService;
// import lombok.RequiredArgsConstructor;
// import org.springframework.http.ResponseEntity;
// import org.springframework.security.access.prepost.PreAuthorize;
// import org.springframework.web.bind.annotation.*;

// @RestController
// @RequestMapping("/api/admin/dashboard")
// @RequiredArgsConstructor
// @CrossOrigin(origins = "*", maxAge = 3600)
// @PreAuthorize("hasRole('ADMIN')")
// public class DashboardController {

//     private final DashboardStatisticsService dashboardStatisticsService;

//     @GetMapping("/stats")
//     public ResponseEntity<DashboardStatsDTO> getDashboardStatistics() {
//         return ResponseEntity.ok(dashboardStatisticsService.getDashboardStatistics());
//     }

//     @GetMapping("/revenue-chart")
//     public ResponseEntity<RevenueChartDTO> getRevenueChart(
//             @RequestParam(required = false, defaultValue = "30") Integer days) {
//         return ResponseEntity.ok(dashboardStatisticsService.getRevenueChart(days));
//     }

//     @GetMapping("/booking-chart")
//     public ResponseEntity<BookingChartDTO> getBookingChart(
//             @RequestParam(required = false, defaultValue = "30") Integer days) {
//         return ResponseEntity.ok(dashboardStatisticsService.getBookingChart(days));
//     }

//     @GetMapping("/user-chart")
//     public ResponseEntity<UserChartDTO> getUserChart(
//             @RequestParam(required = false, defaultValue = "30") Integer days) {
//         return ResponseEntity.ok(dashboardStatisticsService.getUserChart(days));
//     }

//     @GetMapping("/listing-chart")
//     public ResponseEntity<ListingChartDTO> getListingChart() {
//         return ResponseEntity.ok(dashboardStatisticsService.getListingChart());
//     }
// }
