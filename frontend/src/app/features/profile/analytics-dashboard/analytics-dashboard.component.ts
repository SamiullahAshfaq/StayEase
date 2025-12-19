import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { LandlordService } from '../services/landlord.service';
import { Listing, Booking } from '../models/landlord.model';
import { ImageUrlHelper } from '../../../shared/utils/image-url.helper';

interface PropertyRevenue {
  listingPublicId: string;
  listingTitle: string;
  totalRevenue: number;
  totalBookings: number;
  averageNightlyRate: number;
  occupancyRate: number; // percentage
  lastBookingDate?: string;
}

interface RevenueByMonth {
  month: string;
  revenue: number;
}

@Component({
  selector: 'app-analytics-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './analytics-dashboard.component.html',
  styleUrl: './analytics-dashboard.component.css'
})
export class AnalyticsDashboardComponent implements OnInit {
  private landlordService = inject(LandlordService);
  private router = inject(Router);

  // State
  loading = signal(true);
  error = signal<string | null>(null);
  listings = signal<Listing[]>([]);
  
  // Analytics data (mock for now - will be replaced with real API calls later)
  totalRevenue = signal(0);
  totalBookings = signal(0);
  activeListings = signal(0);
  avgOccupancy = signal(0);
  
  propertyRevenues = signal<PropertyRevenue[]>([]);
  monthlyRevenue = signal<RevenueByMonth[]>([]);
  
  // Recent bookings with tenant details
  recentBookings = signal<Booking[]>([]);

  // Landlord info
  landlordName = signal('');
  landlordEmail = signal('');
  memberSince = signal('');

  ngOnInit() {
    this.loadAnalytics();
  }

  loadAnalytics() {
    this.loading.set(true);
    this.error.set(null);

    // Load landlord's listings first
    this.landlordService.getMyListings().subscribe({
      next: (response) => {
        if (response.data) {
          this.listings.set(response.data);
          // Calculate analytics from real bookings instead of mock data
          this.calculateRealAnalytics(response.data);
        }
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error loading analytics:', err);
        this.error.set('Failed to load analytics. Please try again.');
        this.loading.set(false);
      }
    });

    // Load landlord profile info
    this.landlordService.getProfile().subscribe({
      next: (response) => {
        if (response.data) {
          this.landlordName.set(`${response.data.firstName} ${response.data.lastName}`);
          this.landlordEmail.set(response.data.email);
          // Format member since date
          if (response.data.createdAt) {
            const date = new Date(response.data.createdAt);
            this.memberSince.set(date.toLocaleDateString('en-US', { 
              month: 'long', 
              year: 'numeric' 
            }));
          }
        }
      },
      error: (err) => {
        console.error('Error loading profile:', err);
      }
    });

    // Load recent bookings to show tenant details
    // We need to load bookings for ALL landlord's listings
    this.landlordService.getMyListings().subscribe({
      next: (listingsResponse) => {
        if (listingsResponse.data && listingsResponse.data.length > 0) {
          // For each listing, get its bookings
          const listingPublicIds = listingsResponse.data.map(l => l.publicId);
          
          // Create an array to collect all bookings
          const allBookings: Booking[] = [];
          let completedRequests = 0;
          
          listingPublicIds.forEach(listingId => {
            this.landlordService.getBookingsByListing(listingId).subscribe({
              next: (bookingsResponse) => {
                if (bookingsResponse.data) {
                  allBookings.push(...bookingsResponse.data);
                }
                completedRequests++;
                
                // Once all requests complete, sort and set the bookings
                if (completedRequests === listingPublicIds.length) {
                  this.recentBookings.set(
                    allBookings
                      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                      .slice(0, 10)
                  );
                }
              },
              error: (err: unknown) => {
                console.error(`Error loading bookings for listing ${listingId}:`, err);
                completedRequests++;
                
                // Still update display even if some requests fail
                if (completedRequests === listingPublicIds.length) {
                  this.recentBookings.set(
                    allBookings
                      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                      .slice(0, 10)
                  );
                }
              }
            });
          });
        }
      },
      error: (err) => {
        console.error('Error loading listings for bookings:', err);
      }
    });
  }

  /**
   * Calculate real analytics from actual bookings
   */
  private calculateRealAnalytics(listings: Listing[]) {
    // Filter active listings
    const activeListings = listings.filter(l => l.status === 'ACTIVE');
    this.activeListings.set(activeListings.length);

    // We need to fetch bookings for all listings to calculate real revenue
    const listingPublicIds = listings.map(l => l.publicId);
    const propertyRevenuesMap = new Map<string, PropertyRevenue>();
    
    // Initialize property revenues with zero values
    listings.forEach(listing => {
      propertyRevenuesMap.set(listing.publicId, {
        listingPublicId: listing.publicId,
        listingTitle: listing.title,
        totalRevenue: 0,
        totalBookings: 0,
        averageNightlyRate: listing.pricePerNight || 0,
        occupancyRate: 0,
        lastBookingDate: undefined
      });
    });

    let completedRequests = 0;
    const allBookingsMap = new Map<string, Booking[]>();

    listingPublicIds.forEach(listingId => {
      this.landlordService.getBookingsByListing(listingId).subscribe({
        next: (bookingsResponse) => {
          if (bookingsResponse.data) {
            allBookingsMap.set(listingId, bookingsResponse.data);
          }
          completedRequests++;
          
          // Once all requests complete, calculate analytics
          if (completedRequests === listingPublicIds.length) {
            this.processBookingsForAnalytics(listings, allBookingsMap, propertyRevenuesMap);
          }
        },
        error: (err) => {
          console.error(`Error loading bookings for listing ${listingId}:`, err);
          completedRequests++;
          
          // Still process even if some fail
          if (completedRequests === listingPublicIds.length) {
            this.processBookingsForAnalytics(listings, allBookingsMap, propertyRevenuesMap);
          }
        }
      });
    });
  }

  /**
   * Process bookings to calculate real revenue analytics
   */
  private processBookingsForAnalytics(
    listings: Listing[],
    allBookingsMap: Map<string, Booking[]>,
    propertyRevenuesMap: Map<string, PropertyRevenue>
  ) {
    // Calculate revenue for each listing from real bookings
    allBookingsMap.forEach((bookings, listingId) => {
      const listing = listings.find(l => l.publicId === listingId);
      if (!listing) return;

      // Only count confirmed, checked-in, or checked-out bookings (not cancelled/rejected)
      const validBookings = bookings.filter(b => 
        b.status === 'CONFIRMED' || 
        b.status === 'CHECKED_IN' || 
        b.status === 'CHECKED_OUT'
      );

      const totalRevenue = validBookings.reduce((sum, b) => sum + (b.totalPrice || 0), 0);
      const totalBookings = validBookings.length;
      
      // Find most recent booking date
      const lastBooking = validBookings.length > 0
        ? validBookings.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0]
        : null;

      // Calculate occupancy rate
      const daysSinceCreated = listing.createdAt 
        ? Math.floor((new Date().getTime() - new Date(listing.createdAt).getTime()) / (1000 * 60 * 60 * 24))
        : 90;
      
      const totalNightsBooked = validBookings.reduce((sum, b) => sum + (b.numberOfNights || 0), 0);
      const occupancyRate = daysSinceCreated > 0 
        ? Math.min((totalNightsBooked / daysSinceCreated) * 100, 100)
        : 0;

      propertyRevenuesMap.set(listingId, {
        listingPublicId: listingId,
        listingTitle: listing.title,
        totalRevenue: totalRevenue,
        totalBookings: totalBookings,
        averageNightlyRate: listing.pricePerNight || 0,
        occupancyRate: Math.round(occupancyRate * 10) / 10, // Round to 1 decimal
        lastBookingDate: lastBooking ? lastBooking.createdAt : undefined
      });
    });

    // Convert map to array and sort by revenue
    const revenuesArray = Array.from(propertyRevenuesMap.values());
    revenuesArray.sort((a, b) => b.totalRevenue - a.totalRevenue);
    this.propertyRevenues.set(revenuesArray);

    // Calculate totals
    const totalRev = revenuesArray.reduce((sum, p) => sum + p.totalRevenue, 0);
    const totalBook = revenuesArray.reduce((sum, p) => sum + p.totalBookings, 0);
    const avgOcc = revenuesArray.length > 0
      ? revenuesArray.reduce((sum, p) => sum + p.occupancyRate, 0) / revenuesArray.length
      : 0;

    this.totalRevenue.set(totalRev);
    this.totalBookings.set(totalBook);
    this.avgOccupancy.set(Math.round(avgOcc * 10) / 10); // Round to 1 decimal

    // Generate monthly revenue data from real bookings
    this.generateMonthlyRevenueFromBookings(allBookingsMap);
  }

  private generateMonthlyRevenueFromBookings(allBookingsMap: Map<string, Booking[]>) {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentDate = new Date();
    const monthlyData: RevenueByMonth[] = [];

    // Get last 6 months
    for (let i = 5; i >= 0; i--) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
      const monthName = months[date.getMonth()];
      
      let revenue = 0;
      
      // Calculate revenue from bookings in this month
      allBookingsMap.forEach((bookings) => {
        bookings.forEach(booking => {
          if (booking.status === 'CONFIRMED' || 
              booking.status === 'CHECKED_IN' || 
              booking.status === 'CHECKED_OUT') {
            const bookingDate = new Date(booking.createdAt);
            if (bookingDate.getMonth() === date.getMonth() && 
                bookingDate.getFullYear() === date.getFullYear()) {
              revenue += booking.totalPrice || 0;
            }
          }
        });
      });

      monthlyData.push({
        month: monthName,
        revenue: revenue
      });
    }

    this.monthlyRevenue.set(monthlyData);
  }

  private generateMonthlyRevenue(totalRevenue: number): RevenueByMonth[] {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentMonth = new Date().getMonth();
    const last6Months = [];

    // Get last 6 months
    for (let i = 5; i >= 0; i--) {
      const monthIndex = (currentMonth - i + 12) % 12;
      last6Months.push(months[monthIndex]);
    }

    // If no revenue, return empty array or mock data
    if (totalRevenue === 0) {
      // Return mock data with at least some values for demo purposes
      return last6Months.map((month) => ({
        month,
        revenue: Math.floor(Math.random() * 5000) + 1000 // Random revenue between $1000-$6000 for demo
      }));
    }

    // Distribute revenue across months with some variation (total will approximately equal totalRevenue)
    const baseRevenue = totalRevenue / 6;
    return last6Months.map(month => {
      // Add variation: ±30% of base revenue
      const variation = (Math.random() - 0.5) * 0.6; // -0.3 to +0.3
      const monthRevenue = baseRevenue * (1 + variation);
      return {
        month,
        revenue: Math.max(Math.floor(monthRevenue), 100) // Ensure at least $100
      };
    });
  }

  private getRandomRecentDate(): string {
    const daysAgo = Math.floor(Math.random() * 30) + 1; // 1-30 days ago
    const date = new Date();
    date.setDate(date.getDate() - daysAgo);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  }

  viewListing(publicId: string) {
    this.router.navigate(['/listing', publicId]);
  }

  editListing(publicId: string) {
    this.router.navigate(['/profile/listings', publicId, 'edit']);
  }

  getMaxRevenue(): number {
    const revenues = this.propertyRevenues();
    return revenues.length > 0 
      ? Math.max(...revenues.map(r => r.totalRevenue))
      : 1;
  }

  getRevenueBarWidth(revenue: number): number {
    const max = this.getMaxRevenue();
    return (revenue / max) * 100;
  }

  getMaxMonthlyRevenue(): number {
    const monthly = this.monthlyRevenue();
    return monthly.length > 0 
      ? Math.max(...monthly.map(m => m.revenue))
      : 1;
  }

  getMonthlyBarHeight(revenue: number): number {
    const max = this.getMaxMonthlyRevenue();
    return (revenue / max) * 100;
  }

  /**
   * Get full image URL from backend path
   */
  getImageUrl(imagePath: string): string {
    return ImageUrlHelper.getFullImageUrl(imagePath);
  }

  /**
   * Format date for display
   */
  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  }

  /**
   * Get status badge color
   */
  getStatusColor(status: string): string {
    const statusColors: Record<string, string> = {
      'PENDING': 'bg-yellow-100 text-yellow-800',
      'CONFIRMED': 'bg-blue-100 text-blue-800',
      'PAID': 'bg-green-100 text-green-800',
      'CHECKED_IN': 'bg-purple-100 text-purple-800',
      'CHECKED_OUT': 'bg-gray-100 text-gray-800',
      'COMPLETED': 'bg-green-100 text-green-800',
      'CANCELLED': 'bg-red-100 text-red-800',
      'REJECTED': 'bg-red-100 text-red-800'
    };
    return statusColors[status] || 'bg-gray-100 text-gray-800';
  }

  /**
   * Navigate to booking details
   */
  viewBooking(publicId: string) {
    this.router.navigate(['/booking', publicId]);
  }

  /**
   * Get guest avatar or placeholder
   */
  getGuestAvatar(booking: Booking): string {
    if (booking.guestAvatar) {
      return this.getImageUrl(booking.guestAvatar);
    }
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(booking.guestName)}&background=random`;
  }
}
