import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { environment } from '../../../../environments/environment';
import {
  DashboardStats,
  RevenueChartData,
  BookingChartData,
  UserChartData,
  ListingChartData
} from './dashboard.models';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/admin/dashboard`;

  // Toggle this to enable/disable mock data for testing
  private useMockData = false;

  getDashboardStats(): Observable<DashboardStats> {
    if (this.useMockData) {
      return of(this.getMockDashboardStats());
    }
    return this.http.get<DashboardStats>(`${this.apiUrl}/stats`);
  }

  private getMockDashboardStats(): DashboardStats {
    return {
      revenueStats: {
        totalRevenue: 125000,
        todayRevenue: 2500,
        weekRevenue: 15000,
        monthRevenue: 45000,
        yearRevenue: 125000,
        averageBookingValue: 450,
        pendingPayments: 5000,
        completedPayments: 120000,
        revenueGrowthPercentage: 15.5,
        totalTransactions: 278
      },
      bookingStats: {
        totalBookings: 278,
        activeBookings: 45,
        completedBookings: 210,
        cancelledBookings: 23,
        pendingBookings: 12,
        todayBookings: 5,
        weekBookings: 32,
        monthBookings: 105,
        cancellationRate: 8.3,
        occupancyRate: 72.5,
        averageStayDuration: 3.5
      },
      userStats: {
        totalUsers: 1250,
        totalTenants: 980,
        totalLandlords: 265,
        totalAdmins: 5,
        activeUsers: 845,
        inactiveUsers: 405,
        todayRegistrations: 8,
        weekRegistrations: 45,
        monthRegistrations: 156,
        verifiedUsers: 1100,
        userGrowthPercentage: 12.4
      },
      listingStats: {
        totalListings: 342,
        activeListings: 298,
        pendingApproval: 15,
        rejectedListings: 29,
        featuredListings: 48,
        todayListings: 3,
        weekListings: 18,
        monthListings: 62,
        averageRating: 4.3,
        averageOccupancyRate: 68.7
      },
      recentActivity: {
        recentLogins: 156,
        recentBookings: 32,
        recentCancellations: 4,
        recentPayments: 28,
        pendingApprovals: 15,
        recentReviews: 42
      },
      generatedAt: new Date().toISOString()
    };
  }

  getRevenueChart(days = 30): Observable<RevenueChartData> {
    if (this.useMockData) {
      return of(this.getMockRevenueChart(days));
    }
    return this.http.get<RevenueChartData>(`${this.apiUrl}/revenue-chart`, {
      params: { days: days.toString() }
    });
  }

  private getMockRevenueChart(days: number): RevenueChartData {
    const dailyRevenue = Array.from({ length: days }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (days - i - 1));
      return {
        date: date.toISOString().split('T')[0],
        label: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        value: Math.floor(Math.random() * 5000) + 1000,
        count: Math.floor(Math.random() * 20) + 5
      };
    });

    return {
      dailyRevenue,
      paymentMethods: [
        { method: 'Credit Card', amount: 75000, count: 180, percentage: 60 },
        { method: 'Debit Card', amount: 35000, count: 80, percentage: 28 },
        { method: 'PayPal', amount: 15000, count: 18, percentage: 12 }
      ]
    };
  }

  getBookingChart(days = 30): Observable<BookingChartData> {
    if (this.useMockData) {
      return of(this.getMockBookingChart(days));
    }
    return this.http.get<BookingChartData>(`${this.apiUrl}/booking-chart`, {
      params: { days: days.toString() }
    });
  }

  private getMockBookingChart(days: number): BookingChartData {
    const bookingTrends = Array.from({ length: days }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (days - i - 1));
      return {
        date: date.toISOString().split('T')[0],
        label: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        bookings: Math.floor(Math.random() * 15) + 2,
        cancellations: Math.floor(Math.random() * 3),
        completions: Math.floor(Math.random() * 12) + 2
      };
    });

    return {
      bookingTrends,
      statusDistribution: [
        { status: 'Completed', count: 210, percentage: 75.5 },
        { status: 'Active', count: 45, percentage: 16.2 },
        { status: 'Cancelled', count: 23, percentage: 8.3 }
      ]
    };
  }

  getUserChart(days = 30): Observable<UserChartData> {
    if (this.useMockData) {
      return of(this.getMockUserChart(days));
    }
    return this.http.get<UserChartData>(`${this.apiUrl}/user-chart`, {
      params: { days: days.toString() }
    });
  }

  private getMockUserChart(days: number): UserChartData {
    let cumulativeUsers = 1000;
    const userGrowth = Array.from({ length: days }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (days - i - 1));
      const newUsers = Math.floor(Math.random() * 12) + 2;
      cumulativeUsers += newUsers;
      return {
        date: date.toISOString().split('T')[0],
        label: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        newUsers,
        totalUsers: cumulativeUsers,
        activeUsers: Math.floor(cumulativeUsers * 0.7)
      };
    });

    return {
      userGrowth,
      userTypes: [
        { userType: 'TENANT', count: 980, percentage: 78.4 },
        { userType: 'LANDLORD', count: 265, percentage: 21.2 },
        { userType: 'ADMIN', count: 5, percentage: 0.4 }
      ]
    };
  }

  getListingChart(): Observable<ListingChartData> {
    if (this.useMockData) {
      return of(this.getMockListingChart());
    }
    return this.http.get<ListingChartData>(`${this.apiUrl}/listing-chart`);
  }

  private getMockListingChart(): ListingChartData {
    return {
      listingsByType: [
        { propertyType: 'Apartment', count: 145, percentage: 42.4, averagePrice: 1200 },
        { propertyType: 'House', count: 98, percentage: 28.7, averagePrice: 2500 },
        { propertyType: 'Condo', count: 65, percentage: 19.0, averagePrice: 1800 },
        { propertyType: 'Villa', count: 34, percentage: 9.9, averagePrice: 4500 }
      ]
    };
  }
}
