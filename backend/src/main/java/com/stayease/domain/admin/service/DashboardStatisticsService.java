package com.stayease.domain.admin.service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.stayease.domain.admin.dto.BookingChartDTO;
import com.stayease.domain.admin.dto.DashboardStatsDTO;
import com.stayease.domain.admin.dto.ListingChartDTO;
import com.stayease.domain.admin.dto.RevenueChartDTO;
import com.stayease.domain.admin.dto.UserChartDTO;
import com.stayease.domain.booking.entity.Booking;
import com.stayease.domain.booking.repository.BookingRepository;
import com.stayease.domain.listing.entity.Listing;
import com.stayease.domain.listing.repository.ListingRepository;
import com.stayease.domain.payment.entity.Payment;
import com.stayease.domain.payment.repository.PaymentRepository;
import com.stayease.domain.review.entity.Review;
import com.stayease.domain.review.repository.ReviewRepository;
import com.stayease.domain.user.entity.User;
import com.stayease.domain.user.repository.UserRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * Dashboard Statistics Service
 * Provides comprehensive statistics and analytics for the admin dashboard
 */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
@Slf4j
public class DashboardStatisticsService {

    private final UserRepository userRepository;
    private final ListingRepository listingRepository;
    private final BookingRepository bookingRepository;
    private final PaymentRepository paymentRepository;
    private final ReviewRepository reviewRepository;

    /**
     * Get comprehensive dashboard statistics
     */
    public DashboardStatsDTO getDashboardStats() {
        log.info("Generating dashboard statistics");

        LocalDateTime now = LocalDateTime.now();
        LocalDateTime startOfToday = now.toLocalDate().atStartOfDay();
        LocalDateTime startOfWeek = now.minus(7, ChronoUnit.DAYS);
        LocalDateTime startOfMonth = now.minus(30, ChronoUnit.DAYS);
        LocalDateTime startOfYear = now.minus(365, ChronoUnit.DAYS);

        return DashboardStatsDTO.builder()
                .revenueStats(calculateRevenueStats(startOfToday, startOfWeek, startOfMonth, startOfYear))
                .bookingStats(calculateBookingStats(startOfToday, startOfWeek, startOfMonth))
                .userStats(calculateUserStats(startOfToday, startOfWeek, startOfMonth))
                .listingStats(calculateListingStats(startOfToday, startOfWeek, startOfMonth))
                .recentActivity(calculateRecentActivity(startOfWeek))
                .generatedAt(now)
                .build();
    }

    /**
     * Calculate revenue statistics
     */
    private DashboardStatsDTO.RevenueStats calculateRevenueStats(
            LocalDateTime startOfToday, LocalDateTime startOfWeek, 
            LocalDateTime startOfMonth, LocalDateTime startOfYear) {
        
        List<Payment> allPayments = paymentRepository.findAll();
        List<Payment> completedPayments = allPayments.stream()
                .filter(p -> p.getPaymentStatus() == com.stayease.domain.booking.entity.Booking.PaymentStatus.PAID)
                .collect(Collectors.toList());

        BigDecimal totalRevenue = completedPayments.stream()
                .map(Payment::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal todayRevenue = completedPayments.stream()
                .filter(p -> p.getPaymentDate() != null && p.getPaymentDate().isAfter(startOfToday))
                .map(Payment::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal weekRevenue = completedPayments.stream()
                .filter(p -> p.getPaymentDate() != null && p.getPaymentDate().isAfter(startOfWeek))
                .map(Payment::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal monthRevenue = completedPayments.stream()
                .filter(p -> p.getPaymentDate() != null && p.getPaymentDate().isAfter(startOfMonth))
                .map(Payment::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal yearRevenue = completedPayments.stream()
                .filter(p -> p.getPaymentDate() != null && p.getPaymentDate().isAfter(startOfYear))
                .map(Payment::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal avgBookingValue = completedPayments.isEmpty() 
                ? BigDecimal.ZERO 
                : totalRevenue.divide(BigDecimal.valueOf(completedPayments.size()), 2, RoundingMode.HALF_UP);

        BigDecimal pendingPayments = allPayments.stream()
                .filter(p -> p.getPaymentStatus() == com.stayease.domain.booking.entity.Booking.PaymentStatus.PENDING)
                .map(Payment::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        // Calculate growth percentage (comparing current month to previous month)
        LocalDateTime prevMonthStart = startOfMonth.minus(30, ChronoUnit.DAYS);
        BigDecimal prevMonthRevenue = completedPayments.stream()
                .filter(p -> p.getPaymentDate() != null && 
                            p.getPaymentDate().isAfter(prevMonthStart) && 
                            p.getPaymentDate().isBefore(startOfMonth))
                .map(Payment::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        Double growthPercentage = 0.0;
        if (prevMonthRevenue.compareTo(BigDecimal.ZERO) > 0) {
            BigDecimal growth = monthRevenue.subtract(prevMonthRevenue)
                    .divide(prevMonthRevenue, 4, RoundingMode.HALF_UP)
                    .multiply(BigDecimal.valueOf(100));
            growthPercentage = growth.doubleValue();
        }

        return DashboardStatsDTO.RevenueStats.builder()
                .totalRevenue(totalRevenue)
                .todayRevenue(todayRevenue)
                .weekRevenue(weekRevenue)
                .monthRevenue(monthRevenue)
                .yearRevenue(yearRevenue)
                .averageBookingValue(avgBookingValue)
                .pendingPayments(pendingPayments)
                .completedPayments(totalRevenue)
                .revenueGrowthPercentage(growthPercentage)
                .totalTransactions(completedPayments.size())
                .build();
    }

    /**
     * Calculate booking statistics
     */
    private DashboardStatsDTO.BookingStats calculateBookingStats(
            LocalDateTime startOfToday, LocalDateTime startOfWeek, LocalDateTime startOfMonth) {
        
        List<Booking> allBookings = bookingRepository.findAll();

        long totalBookings = allBookings.size();
        long activeBookings = allBookings.stream()
                .filter(b -> b.getBookingStatus() == com.stayease.domain.booking.entity.Booking.BookingStatus.CONFIRMED)
                .count();
        long completedBookings = allBookings.stream()
                .filter(b -> b.getBookingStatus() == com.stayease.domain.booking.entity.Booking.BookingStatus.CHECKED_OUT)
                .count();
        long cancelledBookings = allBookings.stream()
                .filter(b -> b.getBookingStatus() == com.stayease.domain.booking.entity.Booking.BookingStatus.CANCELLED)
                .count();
        long pendingBookings = allBookings.stream()
                .filter(b -> b.getBookingStatus() == com.stayease.domain.booking.entity.Booking.BookingStatus.PENDING)
                .count();

        long todayBookings = allBookings.stream()
                .filter(b -> b.getCreatedAt().isAfter(startOfToday.toInstant(java.time.ZoneOffset.UTC)))
                .count();
        long weekBookings = allBookings.stream()
                .filter(b -> b.getCreatedAt().isAfter(startOfWeek.toInstant(java.time.ZoneOffset.UTC)))
                .count();
        long monthBookings = allBookings.stream()
                .filter(b -> b.getCreatedAt().isAfter(startOfMonth.toInstant(java.time.ZoneOffset.UTC)))
                .count();

        double cancellationRate = totalBookings > 0 
                ? (cancelledBookings * 100.0) / totalBookings 
                : 0.0;

        // Calculate average stay duration
        BigDecimal avgStayDuration = allBookings.stream()
                .filter(b -> b.getCheckInDate() != null && b.getCheckOutDate() != null)
                .map(b -> BigDecimal.valueOf(ChronoUnit.DAYS.between(b.getCheckInDate(), b.getCheckOutDate())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        if (!allBookings.isEmpty()) {
            avgStayDuration = avgStayDuration.divide(BigDecimal.valueOf(allBookings.size()), 2, RoundingMode.HALF_UP);
        }

        return DashboardStatsDTO.BookingStats.builder()
                .totalBookings(totalBookings)
                .activeBookings(activeBookings)
                .completedBookings(completedBookings)
                .cancelledBookings(cancelledBookings)
                .pendingBookings(pendingBookings)
                .todayBookings(todayBookings)
                .weekBookings(weekBookings)
                .monthBookings(monthBookings)
                .cancellationRate(cancellationRate)
                .occupancyRate(calculateOccupancyRate())
                .averageStayDuration(avgStayDuration)
                .build();
    }

    /**
     * Calculate user statistics
     */
    private DashboardStatsDTO.UserStats calculateUserStats(
            LocalDateTime startOfToday, LocalDateTime startOfWeek, LocalDateTime startOfMonth) {
        
        List<User> allUsers = userRepository.findAll();

        long totalUsers = allUsers.size();
        long totalTenants = allUsers.stream()
                .filter(u -> u.getUserAuthorities().stream()
                        .anyMatch(ua -> ua.getAuthority().getName().equals("ROLE_USER")))
                .count();
        long totalLandlords = allUsers.stream()
                .filter(u -> u.getUserAuthorities().stream()
                        .anyMatch(ua -> ua.getAuthority().getName().equals("ROLE_LANDLORD")))
                .count();
        long totalAdmins = allUsers.stream()
                .filter(u -> u.getUserAuthorities().stream()
                        .anyMatch(ua -> ua.getAuthority().getName().equals("ROLE_ADMIN")))
                .count();

        long activeUsers = allUsers.stream()
                .filter(u -> u.getLastLoginAt() != null && 
                            u.getLastLoginAt().isAfter(startOfMonth))
                .count();
        long inactiveUsers = totalUsers - activeUsers;

        long todayRegistrations = allUsers.stream()
                .filter(u -> u.getCreatedAt().isAfter(startOfToday))
                .count();
        long weekRegistrations = allUsers.stream()
                .filter(u -> u.getCreatedAt().isAfter(startOfWeek))
                .count();
        long monthRegistrations = allUsers.stream()
                .filter(u -> u.getCreatedAt().isAfter(startOfMonth))
                .count();

        long verifiedUsers = allUsers.stream()
                .filter(u -> Boolean.TRUE.equals(u.getIsEmailVerified()))
                .count();

        // Calculate growth percentage
        LocalDateTime prevMonthStart = startOfMonth.minus(30, ChronoUnit.DAYS);
        long prevMonthUsers = allUsers.stream()
                .filter(u -> u.getCreatedAt().isAfter(prevMonthStart) && 
                            u.getCreatedAt().isBefore(startOfMonth))
                .count();

        double growthPercentage = 0.0;
        if (prevMonthUsers > 0) {
            growthPercentage = ((monthRegistrations - prevMonthUsers) * 100.0) / prevMonthUsers;
        }

        return DashboardStatsDTO.UserStats.builder()
                .totalUsers(totalUsers)
                .totalTenants(totalTenants)
                .totalLandlords(totalLandlords)
                .totalAdmins(totalAdmins)
                .activeUsers(activeUsers)
                .inactiveUsers(inactiveUsers)
                .todayRegistrations(todayRegistrations)
                .weekRegistrations(weekRegistrations)
                .monthRegistrations(monthRegistrations)
                .verifiedUsers(verifiedUsers)
                .userGrowthPercentage(growthPercentage)
                .build();
    }

    /**
     * Calculate listing statistics
     */
    private DashboardStatsDTO.ListingStats calculateListingStats(
            LocalDateTime startOfToday, LocalDateTime startOfWeek, LocalDateTime startOfMonth) {
        
        List<Listing> allListings = listingRepository.findAll();

        long totalListings = allListings.size();
        long activeListings = allListings.stream()
                .filter(l -> l.getStatus() == Listing.ListingStatus.ACTIVE)
                .count();
        long pendingApproval = allListings.stream()
                .filter(l -> l.getStatus() == Listing.ListingStatus.PENDING_APPROVAL)
                .count();
        long rejectedListings = allListings.stream()
                .filter(l -> l.getStatus() == Listing.ListingStatus.REJECTED)
                .count();
        long featuredListings = 0; // Placeholder - implement when featured field is added

        long todayListings = allListings.stream()
                .filter(l -> l.getCreatedAt().isAfter(startOfToday.toInstant(java.time.ZoneOffset.UTC)))
                .count();
        long weekListings = allListings.stream()
                .filter(l -> l.getCreatedAt().isAfter(startOfWeek.toInstant(java.time.ZoneOffset.UTC)))
                .count();
        long monthListings = allListings.stream()
                .filter(l -> l.getCreatedAt().isAfter(startOfMonth.toInstant(java.time.ZoneOffset.UTC)))
                .count();

        // Calculate average rating
        Double avgRating = reviewRepository.findAll().stream()
                .filter(r -> r.getOverallRating() != null)
                .mapToDouble(Review::getOverallRating)
                .average()
                .orElse(0.0);

        return DashboardStatsDTO.ListingStats.builder()
                .totalListings(totalListings)
                .activeListings(activeListings)
                .pendingApproval(pendingApproval)
                .rejectedListings(rejectedListings)
                .featuredListings(featuredListings)
                .todayListings(todayListings)
                .weekListings(weekListings)
                .monthListings(monthListings)
                .averageRating(avgRating)
                .averageOccupancyRate(calculateOccupancyRate())
                .build();
    }

    /**
     * Calculate recent activity statistics
     */
    private DashboardStatsDTO.RecentActivityStats calculateRecentActivity(LocalDateTime startOfWeek) {
        long recentLogins = userRepository.findAll().stream()
                .filter(u -> u.getLastLoginAt() != null && u.getLastLoginAt().isAfter(startOfWeek))
                .count();

        long recentBookings = bookingRepository.findAll().stream()
                .filter(b -> b.getCreatedAt().isAfter(startOfWeek.toInstant(java.time.ZoneOffset.UTC)))
                .count();

        long recentCancellations = bookingRepository.findAll().stream()
                .filter(b -> b.getBookingStatus() == com.stayease.domain.booking.entity.Booking.BookingStatus.CANCELLED && 
                            b.getCreatedAt().isAfter(startOfWeek.toInstant(java.time.ZoneOffset.UTC)))
                .count();

        long recentPayments = paymentRepository.findAll().stream()
                .filter(p -> p.getPaymentDate() != null && p.getPaymentDate().isAfter(startOfWeek))
                .count();

        long pendingApprovals = listingRepository.findAll().stream()
                .filter(l -> l.getStatus() != null && l.getStatus().name().equals("PENDING"))
                .count();

        long recentReviews = reviewRepository.findAll().stream()
                .filter(r -> r.getCreatedAt().isAfter(startOfWeek))
                .count();

        return DashboardStatsDTO.RecentActivityStats.builder()
                .recentLogins(recentLogins)
                .recentBookings(recentBookings)
                .recentCancellations(recentCancellations)
                .recentPayments(recentPayments)
                .pendingApprovals(pendingApprovals)
                .recentReviews(recentReviews)
                .build();
    }

    /**
     * Calculate overall occupancy rate
     */
    private double calculateOccupancyRate() {
        List<Booking> confirmedBookings = bookingRepository.findAll().stream()
                .filter(b -> b.getBookingStatus() == com.stayease.domain.booking.entity.Booking.BookingStatus.CONFIRMED || 
                            b.getBookingStatus() == com.stayease.domain.booking.entity.Booking.BookingStatus.CHECKED_IN)
                .collect(Collectors.toList());

        if (confirmedBookings.isEmpty()) {
            return 0.0;
        }

        long totalListings = listingRepository.count();
        if (totalListings == 0) {
            return 0.0;
        }

        // Simple occupancy calculation based on bookings
        return Math.min(100.0, (confirmedBookings.size() * 100.0) / (totalListings * 12)); // Assuming 12 potential bookings per listing per year
    }

    /**
     * Get revenue chart data
     */
    public RevenueChartDTO getRevenueChartData(int days) {
        log.info("Generating revenue chart for {} days", days);

        LocalDate endDate = LocalDate.now();
        LocalDate startDate = endDate.minusDays(days);

        List<Payment> completedPayments = paymentRepository.findAll().stream()
                .filter(p -> p.getPaymentStatus() == com.stayease.domain.booking.entity.Booking.PaymentStatus.PAID &&
                            p.getPaymentDate() != null)
                .collect(Collectors.toList());

        // Generate daily revenue data
        List<RevenueChartDTO.DataPoint> dailyRevenue = new ArrayList<>();
        for (LocalDate date = startDate; !date.isAfter(endDate); date = date.plusDays(1)) {
            LocalDate currentDate = date;
            BigDecimal dayRevenue = completedPayments.stream()
                    .filter(p -> p.getPaymentDate().toLocalDate().equals(currentDate))
                    .map(Payment::getAmount)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

            long dayCount = completedPayments.stream()
                    .filter(p -> p.getPaymentDate().toLocalDate().equals(currentDate))
                    .count();

            dailyRevenue.add(RevenueChartDTO.DataPoint.builder()
                    .date(currentDate)
                    .label(currentDate.toString())
                    .value(dayRevenue)
                    .count(dayCount)
                    .build());
        }

        // Payment method breakdown
        Map<String, List<Payment>> paymentsByMethod = completedPayments.stream()
                .collect(Collectors.groupingBy(p -> p.getPaymentMethod() != null ? p.getPaymentMethod() : "Unknown"));

        BigDecimal totalAmount = completedPayments.stream()
                .map(Payment::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        List<RevenueChartDTO.PaymentMethodBreakdown> paymentMethods = paymentsByMethod.entrySet().stream()
                .map(entry -> {
                    BigDecimal methodAmount = entry.getValue().stream()
                            .map(Payment::getAmount)
                            .reduce(BigDecimal.ZERO, BigDecimal::add);
                    
                    double percentage = totalAmount.compareTo(BigDecimal.ZERO) > 0
                            ? methodAmount.divide(totalAmount, 4, RoundingMode.HALF_UP).multiply(BigDecimal.valueOf(100)).doubleValue()
                            : 0.0;

                    return RevenueChartDTO.PaymentMethodBreakdown.builder()
                            .method(entry.getKey())
                            .amount(methodAmount)
                            .count((long) entry.getValue().size())
                            .percentage(percentage)
                            .build();
                })
                .collect(Collectors.toList());

        return RevenueChartDTO.builder()
                .dailyRevenue(dailyRevenue)
                .monthlyRevenue(new ArrayList<>()) // Can be implemented if needed
                .paymentMethods(paymentMethods)
                .revenueByCategory(new ArrayList<>()) // Can be implemented if needed
                .build();
    }

    /**
     * Get booking chart data
     */
    public BookingChartDTO getBookingChartData(int days) {
        log.info("Generating booking chart for {} days", days);

        LocalDate endDate = LocalDate.now();
        LocalDate startDate = endDate.minusDays(days);

        List<Booking> allBookings = bookingRepository.findAll();

        // Generate booking trends
        List<BookingChartDTO.BookingTrend> bookingTrends = new ArrayList<>();
        for (LocalDate date = startDate; !date.isAfter(endDate); date = date.plusDays(1)) {
            LocalDate currentDate = date;
            
            long dayBookings = allBookings.stream()
                    .filter(b -> b.getCreatedAt().atZone(java.time.ZoneId.systemDefault()).toLocalDate().equals(currentDate))
                    .count();

            long dayCancellations = allBookings.stream()
                    .filter(b -> b.getBookingStatus() == com.stayease.domain.booking.entity.Booking.BookingStatus.CANCELLED &&
                                b.getCreatedAt().atZone(java.time.ZoneId.systemDefault()).toLocalDate().equals(currentDate))
                    .count();

            long dayCompletions = allBookings.stream()
                    .filter(b -> b.getBookingStatus() == com.stayease.domain.booking.entity.Booking.BookingStatus.CHECKED_OUT &&
                                b.getCheckOutDate() != null &&
                                b.getCheckOutDate().equals(currentDate))
                    .count();

            bookingTrends.add(BookingChartDTO.BookingTrend.builder()
                    .date(currentDate)
                    .label(currentDate.toString())
                    .bookings(dayBookings)
                    .cancellations(dayCancellations)
                    .completions(dayCompletions)
                    .build());
        }

        // Status distribution
        Map<com.stayease.domain.booking.entity.Booking.BookingStatus, Long> statusCounts = allBookings.stream()
                .collect(Collectors.groupingBy(Booking::getBookingStatus, Collectors.counting()));

        List<BookingChartDTO.StatusDistribution> statusDistribution = statusCounts.entrySet().stream()
                .map(entry -> {
                    double percentage = (entry.getValue() * 100.0) / allBookings.size();
                    return BookingChartDTO.StatusDistribution.builder()
                            .status(entry.getKey().name())
                            .count(entry.getValue())
                            .percentage(percentage)
                            .build();
                })
                .collect(Collectors.toList());

        return BookingChartDTO.builder()
                .bookingTrends(bookingTrends)
                .statusDistribution(statusDistribution)
                .cancellationReasons(new ArrayList<>()) // Can be implemented if cancellation reasons are tracked
                .peakTimes(new ArrayList<>()) // Can be implemented if needed
                .build();
    }

    /**
     * Get user chart data
     */
    public UserChartDTO getUserChartData(int days) {
        log.info("Generating user chart for {} days", days);

        LocalDate endDate = LocalDate.now();
        LocalDate startDate = endDate.minusDays(days);

        List<User> allUsers = userRepository.findAll();

        // User growth trends
        List<UserChartDTO.UserGrowth> userGrowth = new ArrayList<>();
        long cumulativeUsers = allUsers.stream()
                .filter(u -> u.getCreatedAt().toLocalDate().isBefore(startDate))
                .count();

        for (LocalDate date = startDate; !date.isAfter(endDate); date = date.plusDays(1)) {
            LocalDate currentDate = date;
            
            long newUsers = allUsers.stream()
                    .filter(u -> u.getCreatedAt().toLocalDate().equals(currentDate))
                    .count();

            cumulativeUsers += newUsers;

            long activeUsers = allUsers.stream()
                    .filter(u -> u.getLastLoginAt() != null &&
                                u.getLastLoginAt().toLocalDate().equals(currentDate))
                    .count();

            userGrowth.add(UserChartDTO.UserGrowth.builder()
                    .date(currentDate)
                    .label(currentDate.toString())
                    .newUsers(newUsers)
                    .totalUsers(cumulativeUsers)
                    .activeUsers(activeUsers)
                    .build());
        }

        // User type distribution
        Map<String, Long> userTypeCounts = allUsers.stream()
                .flatMap(u -> u.getUserAuthorities().stream())
                .map(ua -> ua.getAuthority().getName())
                .collect(Collectors.groupingBy(role -> role, Collectors.counting()));

        List<UserChartDTO.UserTypeDistribution> userTypes = userTypeCounts.entrySet().stream()
                .map(entry -> {
                    double percentage = (entry.getValue() * 100.0) / allUsers.size();
                    return UserChartDTO.UserTypeDistribution.builder()
                            .userType(entry.getKey())
                            .count(entry.getValue())
                            .percentage(percentage)
                            .build();
                })
                .collect(Collectors.toList());

        return UserChartDTO.builder()
                .userGrowth(userGrowth)
                .userTypes(userTypes)
                .activityHeatmap(new ArrayList<>()) // Can be implemented if needed
                .topActiveUsers(new ArrayList<>()) // Can be implemented if needed
                .build();
    }

    /**
     * Get listing chart data
     */
    public ListingChartDTO getListingChartData() {
        log.info("Generating listing chart");

        List<Listing> allListings = listingRepository.findAll();

        // Listings by location
        Map<String, List<Listing>> listingsByCity = allListings.stream()
                .filter(l -> l.getCity() != null)
                .collect(Collectors.groupingBy(Listing::getCity));

        List<ListingChartDTO.ListingDistribution> listingsByLocation = listingsByCity.entrySet().stream()
                .map(entry -> {
                    double percentage = (entry.getValue().size() * 100.0) / allListings.size();
                    String country = entry.getValue().isEmpty() ? "Unknown" : 
                                    (entry.getValue().get(0).getCountry() != null ? entry.getValue().get(0).getCountry() : "Unknown");
                    
                    return ListingChartDTO.ListingDistribution.builder()
                            .location(entry.getKey())
                            .city(entry.getKey())
                            .country(country)
                            .count((long) entry.getValue().size())
                            .percentage(percentage)
                            .build();
                })
                .collect(Collectors.toList());

        // Listings by type
        Map<String, List<Listing>> listingsByType = allListings.stream()
                .filter(l -> l.getPropertyType() != null)
                .collect(Collectors.groupingBy(l -> l.getPropertyType().toString()));

        List<ListingChartDTO.ListingByType> listingsByTypeData = listingsByType.entrySet().stream()
                .map(entry -> {
                    double percentage = (entry.getValue().size() * 100.0) / allListings.size();
                    BigDecimal avgPrice = entry.getValue().stream()
                            .map(Listing::getPricePerNight)
                            .reduce(BigDecimal.ZERO, BigDecimal::add)
                            .divide(BigDecimal.valueOf(entry.getValue().size()), 2, RoundingMode.HALF_UP);

                    return ListingChartDTO.ListingByType.builder()
                            .propertyType(entry.getKey())
                            .count((long) entry.getValue().size())
                            .percentage(percentage)
                            .averagePrice(avgPrice)
                            .build();
                })
                .collect(Collectors.toList());

        return ListingChartDTO.builder()
                .listingsByLocation(listingsByLocation)
                .listingsByType(listingsByTypeData)
                .occupancyRates(new ArrayList<>()) // Can be implemented if needed
                .topPerformingListings(new ArrayList<>()) // Can be implemented if needed
                .build();
    }
}
