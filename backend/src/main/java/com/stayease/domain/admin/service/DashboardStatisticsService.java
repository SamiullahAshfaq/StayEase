// package com.stayease.domain.admin.service;

// import java.math.BigDecimal;
// import java.math.RoundingMode;
// import java.time.LocalDate;
// import java.time.LocalDateTime;
// import java.util.ArrayList;
// import java.util.List;

// import org.springframework.stereotype.Service;
// import org.springframework.transaction.annotation.Transactional;

// import com.stayease.domain.admin.dto.BookingChartDTO;
// import com.stayease.domain.admin.dto.DashboardStatsDTO;
// import com.stayease.domain.admin.dto.ListingChartDTO;
// import com.stayease.domain.admin.dto.RevenueChartDTO;
// import com.stayease.domain.admin.dto.UserChartDTO;
// import com.stayease.domain.booking.repository.BookingRepository;
// import com.stayease.domain.listing.repository.ListingRepository;
// import com.stayease.domain.payment.repository.PaymentRepository;
// import com.stayease.domain.user.repository.UserRepository;

// import lombok.RequiredArgsConstructor;
// import lombok.extern.slf4j.Slf4j;

// @Service
// @RequiredArgsConstructor
// @Slf4j
// @Transactional(readOnly = true)
// public class DashboardStatisticsService {

//     private final BookingRepository bookingRepository;
//     private final ListingRepository listingRepository;
//     private final PaymentRepository paymentRepository;
//     private final UserRepository userRepository;

//     public DashboardStatsDTO getDashboardStatistics() {
//         log.info("Generating dashboard statistics");
        
//         LocalDateTime now = LocalDateTime.now();
//         LocalDate today = LocalDate.now();
//         LocalDate weekAgo = today.minusWeeks(1);
//         LocalDate monthAgo = today.minusMonths(1);
//         LocalDate yearAgo = today.minusYears(1);

//         return DashboardStatsDTO.builder()
//                 .revenueStats(calculateRevenueStats(today, weekAgo, monthAgo, yearAgo))
//                 .bookingStats(calculateBookingStats(today, weekAgo, monthAgo))
//                 .userStats(calculateUserStats(today, weekAgo, monthAgo))
//                 .listingStats(calculateListingStats(today, weekAgo, monthAgo))
//                 .recentActivity(calculateRecentActivity())
//                 .generatedAt(now)
//                 .build();
//     }

//     private DashboardStatsDTO.RevenueStats calculateRevenueStats(
//             LocalDate today, LocalDate weekAgo, LocalDate monthAgo, LocalDate yearAgo) {
        
//         // Get total revenue
//         BigDecimal totalRevenue = paymentRepository.findTotalRevenue()
//                 .orElse(BigDecimal.ZERO);
        
//         // Get revenue by date ranges
//         BigDecimal todayRevenue = paymentRepository.findRevenueByDateRange(today.atStartOfDay(), today.plusDays(1).atStartOfDay())
//                 .orElse(BigDecimal.ZERO);
        
//         BigDecimal weekRevenue = paymentRepository.findRevenueByDateRange(weekAgo.atStartOfDay(), LocalDateTime.now())
//                 .orElse(BigDecimal.ZERO);
        
//         BigDecimal monthRevenue = paymentRepository.findRevenueByDateRange(monthAgo.atStartOfDay(), LocalDateTime.now())
//                 .orElse(BigDecimal.ZERO);
        
//         BigDecimal yearRevenue = paymentRepository.findRevenueByDateRange(yearAgo.atStartOfDay(), LocalDateTime.now())
//                 .orElse(BigDecimal.ZERO);

//         // Get payment status breakdown
//         BigDecimal pendingPayments = paymentRepository.findPendingPayments()
//                 .orElse(BigDecimal.ZERO);
        
//         BigDecimal completedPayments = paymentRepository.findCompletedPayments()
//                 .orElse(BigDecimal.ZERO);

//         // Calculate average booking value
//         BigDecimal averageBookingValue = paymentRepository.findAveragePaymentAmount()
//                 .orElse(BigDecimal.ZERO);

//         // Calculate growth percentage
//         BigDecimal lastMonthRevenue = paymentRepository.findRevenueByDateRange(
//                 monthAgo.minusMonths(1).atStartOfDay(), monthAgo.atStartOfDay())
//                 .orElse(BigDecimal.ZERO);
        
//         Double growthPercentage = calculateGrowthPercentage(lastMonthRevenue, monthRevenue);

//         Integer totalTransactions = paymentRepository.countAllPayments();

//         return DashboardStatsDTO.RevenueStats.builder()
//                 .totalRevenue(totalRevenue)
//                 .todayRevenue(todayRevenue)
//                 .weekRevenue(weekRevenue)
//                 .monthRevenue(monthRevenue)
//                 .yearRevenue(yearRevenue)
//                 .averageBookingValue(averageBookingValue)
//                 .pendingPayments(pendingPayments)
//                 .completedPayments(completedPayments)
//                 .revenueGrowthPercentage(growthPercentage)
//                 .totalTransactions(totalTransactions)
//                 .build();
//     }

//     private DashboardStatsDTO.BookingStats calculateBookingStats(
//             LocalDate today, LocalDate weekAgo, LocalDate monthAgo) {
        
//         Long totalBookings = bookingRepository.count();
//         Long activeBookings = bookingRepository.countByBookingStatus("CONFIRMED");
//         Long completedBookings = bookingRepository.countByBookingStatus("COMPLETED");
//         Long cancelledBookings = bookingRepository.countByBookingStatus("CANCELLED");
//         Long pendingBookings = bookingRepository.countByBookingStatus("PENDING");
        
//         Long todayBookings = bookingRepository.countByCreatedAtAfter(today.atStartOfDay());
//         Long weekBookings = bookingRepository.countByCreatedAtAfter(weekAgo.atStartOfDay());
//         Long monthBookings = bookingRepository.countByCreatedAtAfter(monthAgo.atStartOfDay());

//         // Calculate cancellation rate
//         Double cancellationRate = totalBookings > 0 
//                 ? (cancelledBookings.doubleValue() / totalBookings.doubleValue()) * 100 
//                 : 0.0;

//         // Calculate occupancy rate (simplified)
//         Double occupancyRate = calculateOccupancyRate();

//         // Calculate average stay duration
//         BigDecimal averageStayDuration = bookingRepository.findAverageNumberOfNights()
//                 .orElse(BigDecimal.ZERO);

//         return DashboardStatsDTO.BookingStats.builder()
//                 .totalBookings(totalBookings)
//                 .activeBookings(activeBookings)
//                 .completedBookings(completedBookings)
//                 .cancelledBookings(cancelledBookings)
//                 .pendingBookings(pendingBookings)
//                 .todayBookings(todayBookings)
//                 .weekBookings(weekBookings)
//                 .monthBookings(monthBookings)
//                 .cancellationRate(round(cancellationRate, 2))
//                 .occupancyRate(round(occupancyRate, 2))
//                 .averageStayDuration(averageStayDuration)
//                 .build();
//     }

//     private DashboardStatsDTO.UserStats calculateUserStats(
//             LocalDate today, LocalDate weekAgo, LocalDate monthAgo) {
        
//         Long totalUsers = userRepository.count();
//         Long totalTenants = userRepository.countByRoleName("ROLE_USER");
//         Long totalLandlords = userRepository.countByRoleName("ROLE_LANDLORD");
//         Long totalAdmins = userRepository.countByRoleName("ROLE_ADMIN");
        
//         Long activeUsers = userRepository.countByAccountStatus("ACTIVE");
//         Long inactiveUsers = totalUsers - activeUsers;
        
//         Long todayRegistrations = userRepository.countByCreatedAtAfter(today.atStartOfDay());
//         Long weekRegistrations = userRepository.countByCreatedAtAfter(weekAgo.atStartOfDay());
//         Long monthRegistrations = userRepository.countByCreatedAtAfter(monthAgo.atStartOfDay());
        
//         Long verifiedUsers = userRepository.countByIsEmailVerified(true);

//         // Calculate growth percentage
//         Long lastMonthRegistrations = userRepository.countByCreatedAtBetween(
//                 monthAgo.minusMonths(1).atStartOfDay(), monthAgo.atStartOfDay());
        
//         Double growthPercentage = lastMonthRegistrations > 0 
//                 ? ((double) (monthRegistrations - lastMonthRegistrations) / lastMonthRegistrations.doubleValue()) * 100 
//                 : 0.0;

//         return DashboardStatsDTO.UserStats.builder()
//                 .totalUsers(totalUsers)
//                 .totalTenants(totalTenants)
//                 .totalLandlords(totalLandlords)
//                 .totalAdmins(totalAdmins)
//                 .activeUsers(activeUsers)
//                 .inactiveUsers(inactiveUsers)
//                 .todayRegistrations(todayRegistrations)
//                 .weekRegistrations(weekRegistrations)
//                 .monthRegistrations(monthRegistrations)
//                 .verifiedUsers(verifiedUsers)
//                 .userGrowthPercentage(round(growthPercentage, 2))
//                 .build();
//     }

//     private DashboardStatsDTO.ListingStats calculateListingStats(
//             LocalDate today, LocalDate weekAgo, LocalDate monthAgo) {
        
//         Long totalListings = listingRepository.count();
//         Long activeListings = listingRepository.countByStatus("ACTIVE");
//         Long pendingApproval = listingRepository.countByStatus("PENDING");
//         Long rejectedListings = listingRepository.countByStatus("REJECTED");
//         Long featuredListings = listingRepository.countByInstantBook(true);
        
//         Long todayListings = listingRepository.countByCreatedAtAfter(today.atStartOfDay());
//         Long weekListings = listingRepository.countByCreatedAtAfter(weekAgo.atStartOfDay());
//         Long monthListings = listingRepository.countByCreatedAtAfter(monthAgo.atStartOfDay());

//         // Calculate average rating (from reviews)
//         // TODO: Calculate from review table once ReviewRepository is implemented
//         // Example: Double averageRating = reviewRepository.findAverageRatingForAllListings().orElse(0.0);
//         Double averageRating = 0.0;

//         // Calculate average occupancy rate
//         Double averageOccupancyRate = calculateOccupancyRate();

//         return DashboardStatsDTO.ListingStats.builder()
//                 .totalListings(totalListings)
//                 .activeListings(activeListings)
//                 .pendingApproval(pendingApproval)
//                 .rejectedListings(rejectedListings)
//                 .featuredListings(featuredListings)
//                 .todayListings(todayListings)
//                 .weekListings(weekListings)
//                 .monthListings(monthListings)
//                 .averageRating(averageRating)
//                 .averageOccupancyRate(round(averageOccupancyRate, 2))
//                 .build();
//     }

//     private DashboardStatsDTO.RecentActivityStats calculateRecentActivity() {
//         LocalDateTime last24Hours = LocalDateTime.now().minusHours(24);
        
//         Long recentLogins = userRepository.countByLastLoginAtAfter(last24Hours);
//         Long recentBookings = bookingRepository.countByCreatedAtAfter(last24Hours);
//         Long recentCancellations = bookingRepository.countByCancelledAtAfter(last24Hours);
//         Long recentPayments = paymentRepository.countByCreatedAtAfter(last24Hours);
//         Long pendingApprovals = listingRepository.countByStatus("PENDING");
//         // TODO: Implement when ReviewRepository is created
//         // Example: Long recentReviews = reviewRepository.countByCreatedAtAfter(last24Hours);
//         Long recentReviews = 0L;

//         return DashboardStatsDTO.RecentActivityStats.builder()
//                 .recentLogins(recentLogins)
//                 .recentBookings(recentBookings)
//                 .recentCancellations(recentCancellations)
//                 .recentPayments(recentPayments)
//                 .pendingApprovals(pendingApprovals)
//                 .recentReviews(recentReviews)
//                 .build();
//     }

//     private Double calculateOccupancyRate() {
//         // Simplified calculation: (completed bookings / total possible days) * 100
//         Long totalListings = listingRepository.count();
//         Long completedBookings = bookingRepository.countByBookingStatus("COMPLETED");
        
//         if (totalListings == 0) return 0.0;
        
//         // Average days in a month
//         double possibleDays = totalListings * 30.0;
//         double bookedDays = completedBookings * 3.0; // Assuming average 3-day stay
        
//         return (bookedDays / possibleDays) * 100;
//     }

//     private Double calculateGrowthPercentage(BigDecimal previous, BigDecimal current) {
//         if (previous.compareTo(BigDecimal.ZERO) == 0) {
//             return current.compareTo(BigDecimal.ZERO) > 0 ? 100.0 : 0.0;
//         }
        
//         BigDecimal difference = current.subtract(previous);
//         BigDecimal percentage = difference.divide(previous, 4, RoundingMode.HALF_UP)
//                 .multiply(new BigDecimal("100"));
        
//         return percentage.doubleValue();
//     }

//     private Double round(Double value, int places) {
//         if (value == null) return 0.0;
//         BigDecimal bd = BigDecimal.valueOf(value);
//         bd = bd.setScale(places, RoundingMode.HALF_UP);
//         return bd.doubleValue();
//     }

//     private String formatPaymentMethod(String method) {
//         if (method == null) return "Other";
        
//         return switch (method) {
//             case "CREDIT_CARD" -> "Credit Card";
//             case "DEBIT_CARD" -> "Debit Card";
//             case "PAYPAL" -> "PayPal";
//             case "STRIPE" -> "Stripe";
//             case "BANK_TRANSFER" -> "Bank Transfer";
//             case "CASH" -> "Cash";
//             default -> method;
//         };
//     }

//     // Chart data methods
//     public RevenueChartDTO getRevenueChart(Integer days) {
//         List<RevenueChartDTO.DataPoint> dailyRevenue = new ArrayList<>();
//         LocalDate endDate = LocalDate.now();
//         LocalDate startDate = endDate.minusDays(days);

//         // Generate daily revenue data
//         for (LocalDate date = startDate; !date.isAfter(endDate); date = date.plusDays(1)) {
//             BigDecimal revenue = paymentRepository.findRevenueByDateRange(
//                     date.atStartOfDay(), date.plusDays(1).atStartOfDay())
//                     .orElse(BigDecimal.ZERO);
            
//             Long count = paymentRepository.countByCreatedAtAfter(date.atStartOfDay());
            
//             dailyRevenue.add(RevenueChartDTO.DataPoint.builder()
//                     .date(date)
//                     .label(date.toString())
//                     .value(revenue)
//                     .count(count)
//                     .build());
//         }

//         // Payment method breakdown from database
//         List<Object[]> methodBreakdown = paymentRepository.getPaymentMethodBreakdown();
//         BigDecimal totalAmount = methodBreakdown.stream()
//                 .map(row -> (BigDecimal) row[2])
//                 .reduce(BigDecimal.ZERO, BigDecimal::add);
        
//         List<RevenueChartDTO.PaymentMethodBreakdown> paymentMethods = methodBreakdown.stream()
//                 .map(row -> {
//                     String method = row[0].toString();
//                     Long count = ((Number) row[1]).longValue();
//                     BigDecimal amount = (BigDecimal) row[2];
//                     Double percentage = totalAmount.compareTo(BigDecimal.ZERO) > 0
//                             ? amount.divide(totalAmount, 4, RoundingMode.HALF_UP)
//                                     .multiply(new BigDecimal("100")).doubleValue()
//                             : 0.0;
                    
//                     return RevenueChartDTO.PaymentMethodBreakdown.builder()
//                             .method(formatPaymentMethod(method))
//                             .amount(amount)
//                             .count(count)
//                             .percentage(round(percentage, 2))
//                             .build();
//                 })
//                 .toList();

//         return RevenueChartDTO.builder()
//                 .dailyRevenue(dailyRevenue)
//                 .paymentMethods(paymentMethods)
//                 .build();
//     }

//     public BookingChartDTO getBookingChart(Integer days) {
//         List<BookingChartDTO.BookingTrend> bookingTrends = new ArrayList<>();
//         LocalDate endDate = LocalDate.now();
//         LocalDate startDate = endDate.minusDays(days);

//         for (LocalDate date = startDate; !date.isAfter(endDate); date = date.plusDays(1)) {
//             Long bookings = bookingRepository.countByCreatedAtAfter(date.atStartOfDay());
//             Long cancellations = bookingRepository.countByCancelledAtAfter(date.atStartOfDay());
//             Long completions = bookingRepository.countByBookingStatus("COMPLETED");
            
//             bookingTrends.add(BookingChartDTO.BookingTrend.builder()
//                     .date(date)
//                     .label(date.toString())
//                     .bookings(bookings)
//                     .cancellations(cancellations)
//                     .completions(completions)
//                     .build());
//         }

//         // Status distribution
//         List<BookingChartDTO.StatusDistribution> statusDistribution = List.of(
//                 BookingChartDTO.StatusDistribution.builder()
//                         .status("Confirmed").count(bookingRepository.countByBookingStatus("CONFIRMED")).percentage(45.0).build(),
//                 BookingChartDTO.StatusDistribution.builder()
//                         .status("Completed").count(bookingRepository.countByBookingStatus("COMPLETED")).percentage(35.0).build(),
//                 BookingChartDTO.StatusDistribution.builder()
//                         .status("Pending").count(bookingRepository.countByBookingStatus("PENDING")).percentage(15.0).build(),
//                 BookingChartDTO.StatusDistribution.builder()
//                         .status("Cancelled").count(bookingRepository.countByBookingStatus("CANCELLED")).percentage(5.0).build()
//         );

//         return BookingChartDTO.builder()
//                 .bookingTrends(bookingTrends)
//                 .statusDistribution(statusDistribution)
//                 .build();
//     }

//     public UserChartDTO getUserChart(Integer days) {
//         List<UserChartDTO.UserGrowth> userGrowth = new ArrayList<>();
//         LocalDate endDate = LocalDate.now();
//         LocalDate startDate = endDate.minusDays(days);

//         for (LocalDate date = startDate; !date.isAfter(endDate); date = date.plusDays(1)) {
//             Long newUsers = userRepository.countByCreatedAtAfter(date.atStartOfDay());
//             Long totalUsers = userRepository.count();
//             Long activeUsers = userRepository.countByAccountStatus("ACTIVE");
            
//             userGrowth.add(UserChartDTO.UserGrowth.builder()
//                     .date(date)
//                     .label(date.toString())
//                     .newUsers(newUsers)
//                     .totalUsers(totalUsers)
//                     .activeUsers(activeUsers)
//                     .build());
//         }

//         // User type distribution
//         List<UserChartDTO.UserTypeDistribution> userTypes = List.of(
//                 UserChartDTO.UserTypeDistribution.builder()
//                         .userType("Tenants").count(userRepository.countByRoleName("ROLE_USER")).percentage(70.0).build(),
//                 UserChartDTO.UserTypeDistribution.builder()
//                         .userType("Landlords").count(userRepository.countByRoleName("ROLE_LANDLORD")).percentage(28.0).build(),
//                 UserChartDTO.UserTypeDistribution.builder()
//                         .userType("Admins").count(userRepository.countByRoleName("ROLE_ADMIN")).percentage(2.0).build()
//         );

//         return UserChartDTO.builder()
//                 .userGrowth(userGrowth)
//                 .userTypes(userTypes)
//                 .build();
//     }

//     public ListingChartDTO getListingChart() {
//         // Listing type distribution
//         List<ListingChartDTO.ListingByType> listingsByType = List.of(
//                 ListingChartDTO.ListingByType.builder()
//                         .propertyType("Apartment").count(45L).percentage(45.0).averagePrice(new BigDecimal("120")).build(),
//                 ListingChartDTO.ListingByType.builder()
//                         .propertyType("House").count(30L).percentage(30.0).averagePrice(new BigDecimal("200")).build(),
//                 ListingChartDTO.ListingByType.builder()
//                         .propertyType("Condo").count(15L).percentage(15.0).averagePrice(new BigDecimal("150")).build(),
//                 ListingChartDTO.ListingByType.builder()
//                         .propertyType("Villa").count(10L).percentage(10.0).averagePrice(new BigDecimal("350")).build()
//         );

//         return ListingChartDTO.builder()
//                 .listingsByType(listingsByType)
//                 .build();
//     }
// }

