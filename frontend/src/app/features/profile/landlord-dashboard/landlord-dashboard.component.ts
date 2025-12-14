import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { LandlordService } from '../services/landlord.service';
import {
  LandlordProfile,
  ListingStats,
  Listing,
  Booking,
  BookingStatus,
  LISTING_STATUS_LABELS,
  BOOKING_STATUS_LABELS
} from '../models/landlord.model';

@Component({
  selector: 'app-landlord-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './landlord-dashboard.component.html',
  styleUrl: './landlord-dashboard.component.css'
})
export class LandlordDashboardComponent implements OnInit {
  private landlordService = inject(LandlordService);
  private router = inject(Router);

  // State
  profile = signal<LandlordProfile | null>(null);
  stats = signal<ListingStats | null>(null);
  recentListings = signal<Listing[]>([]);
  upcomingBookings = signal<Booking[]>([]);
  pendingBookings = signal<Booking[]>([]);
  
  loading = signal(true);
  error = signal<string | null>(null);

  // Active tab
  activeTab = signal<'overview' | 'listings' | 'bookings' | 'earnings' | 'profile'>('overview');

  // Labels
  listingStatusLabels = LISTING_STATUS_LABELS;
  bookingStatusLabels = BOOKING_STATUS_LABELS;

  ngOnInit() {
    this.loadDashboardData();
  }

  loadDashboardData() {
    this.loading.set(true);
    this.error.set(null);

    // Load profile
    this.landlordService.getProfile().subscribe({
      next: (response) => {
        this.profile.set(response.data);
      },
      error: (err) => {
        console.error('Error loading profile:', err);
        this.error.set('Failed to load profile data');
      }
    });

    // Load stats
    this.landlordService.getStats().subscribe({
      next: (response) => {
        this.stats.set(response.data);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error loading stats:', err);
        this.loading.set(false);
      }
    });

    // Load recent listings
    this.landlordService.getMyListings().subscribe({
      next: (response) => {
        this.recentListings.set(response.data.slice(0, 4));
      },
      error: (err) => console.error('Error loading listings:', err)
    });

    // Load bookings
    this.landlordService.getMyBookings().subscribe({
      next: (response) => {
        const bookings = response.data;
        this.pendingBookings.set(
          bookings.filter(b => b.status === BookingStatus.PENDING).slice(0, 5)
        );
        this.upcomingBookings.set(
          bookings.filter(b => b.status === BookingStatus.CONFIRMED).slice(0, 5)
        );
      },
      error: (err) => console.error('Error loading bookings:', err)
    });
  }

  switchTab(tab: 'overview' | 'listings' | 'bookings' | 'earnings' | 'profile') {
    this.activeTab.set(tab);
  }

  navigateToListings() {
    this.router.navigate(['/profile/listings']);
  }

  navigateToBookings() {
    this.router.navigate(['/profile/bookings']);
  }

  navigateToEarnings() {
    this.router.navigate(['/profile/earnings']);
  }

  navigateToProfile() {
    this.router.navigate(['/profile/edit']);
  }

  createListing() {
    this.router.navigate(['/profile/listings/create']);
  }

  viewListing(publicId: string) {
    this.router.navigate(['/profile/listings', publicId]);
  }

  editListing(publicId: string, event: Event) {
    event.stopPropagation();
    this.router.navigate(['/profile/listings', publicId, 'edit']);
  }

  viewBooking(publicId: string) {
    this.router.navigate(['/profile/bookings', publicId]);
  }

  confirmBooking(publicId: string, event: Event) {
    event.stopPropagation();
    
    if (confirm('Confirm this booking?')) {
      this.landlordService.confirmBooking(publicId).subscribe({
        next: () => {
          this.loadDashboardData();
        },
        error: (err) => {
          console.error('Error confirming booking:', err);
          alert('Failed to confirm booking');
        }
      });
    }
  }

  rejectBooking(publicId: string, event: Event) {
    event.stopPropagation();
    
    const reason = prompt('Please provide a reason for rejection:');
    if (reason) {
      this.landlordService.rejectBooking(publicId, reason).subscribe({
        next: () => {
          this.loadDashboardData();
        },
        error: (err) => {
          console.error('Error rejecting booking:', err);
          alert('Failed to reject booking');
        }
      });
    }
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(price);
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  }

  formatShortDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  }

  getInitials(name: string): string {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }

  getStatusClass(status: string): string {
    const statusLower = status.toLowerCase();
    if (statusLower === 'active' || statusLower === 'confirmed' || statusLower === 'paid') {
      return 'status-success';
    }
    if (statusLower === 'pending') {
      return 'status-warning';
    }
    if (statusLower === 'cancelled' || statusLower === 'rejected' || statusLower === 'suspended') {
      return 'status-danger';
    }
    return 'status-default';
  }

  calculateOccupancyPercentage(): number {
    const stats = this.stats();
    return stats ? Math.round(stats.occupancyRate * 100) : 0;
  }

  getResponseRateClass(): string {
    const profile = this.profile();
    if (!profile || !profile.responseRate) return 'rate-low';
    
    if (profile.responseRate >= 90) return 'rate-high';
    if (profile.responseRate >= 70) return 'rate-medium';
    return 'rate-low';
  }
}
