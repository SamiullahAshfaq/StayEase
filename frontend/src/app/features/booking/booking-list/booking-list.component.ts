import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, NavigationEnd } from '@angular/router';
import { BookingService } from '../services/booking.service';
import { MockBookingService } from '../services/mock-booking.service';
import { Booking, BookingStatus } from '../models/booking.model';
import { FormsModule } from '@angular/forms';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-booking-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './booking-list.component.html',
  providers: [
    { provide: BookingService, useClass: MockBookingService }
  ]
})
export class BookingListComponent implements OnInit {
  bookings: Booking[] = [];
  filteredBookings: Booking[] = [];
  loading = false;
  error: string | null = null;

  // Pagination
  currentPage = 0;
  pageSize = 10;
  totalPages = 1; // Initialize to 1 instead of 0 to avoid -1 calculations
  totalElements = 0;

  // Filters
  selectedTab: 'all' | 'upcoming' | 'past' | 'cancelled' = 'all';
  
  // Cancel modal
  showCancelModal = false;
  bookingToCancel: Booking | null = null;
  cancelReason = '';
  cancelling = false;

  constructor(
    private bookingService: BookingService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {
    // Subscribe to route changes to reload bookings
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        // Reload bookings when navigating to this page
        if (this.router.url.includes('/booking/list')) {
          console.log('Reloading bookings due to navigation');
          this.loadBookings();
        }
      });
  }

  ngOnInit(): void {
    console.log('BookingListComponent initialized');
    this.loadBookings();
  }

  loadBookings(): void {
    console.log('loadBookings() called');
    this.loading = true;
    this.error = null;
    this.cdr.detectChanges(); // Force update to show spinner

    this.bookingService.getMyBookings(this.currentPage, this.pageSize).subscribe({
      next: (response) => {
        console.log('Bookings response received:', response);
        if (response.success && response.data) {
          this.bookings = response.data.content;
          console.log('Loaded bookings:', this.bookings.length);
          this.currentPage = response.data.number;
          this.pageSize = response.data.size;
          this.totalPages = response.data.totalPages;
          this.totalElements = response.data.totalElements;
          this.filterBookings();
          console.log('Filtered bookings:', this.filteredBookings.length);
          
          // Force loading to false and trigger change detection
          this.loading = false;
          console.log('Loading set to false, triggering change detection');
          this.cdr.detectChanges();
        } else {
          this.loading = false;
          this.cdr.detectChanges();
          console.log('Loading set to false (no data)');
        }
      },
      error: (error) => {
        console.error('Error loading bookings:', error);
        this.error = 'Failed to load bookings. Please try again.';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  filterBookings(): void {
    const now = new Date();
    console.log('filterBookings() called, selectedTab:', this.selectedTab);
    console.log('Current date:', now);
    
    switch (this.selectedTab) {
      case 'upcoming':
        this.filteredBookings = this.bookings.filter(b => {
          const checkInDate = new Date(b.checkInDate);
          console.log('Checking booking:', b.listingTitle, 'checkInDate:', checkInDate, 'isAfterNow:', checkInDate > now);
          return checkInDate > now && 
            b.bookingStatus !== BookingStatus.CANCELLED && 
            b.bookingStatus !== BookingStatus.REJECTED;
        });
        break;
      case 'past':
        this.filteredBookings = this.bookings.filter(b => 
          new Date(b.checkOutDate) < now &&
          b.bookingStatus !== BookingStatus.CANCELLED
        );
        break;
      case 'cancelled':
        this.filteredBookings = this.bookings.filter(b => 
          b.bookingStatus === BookingStatus.CANCELLED || 
          b.bookingStatus === BookingStatus.REJECTED
        );
        break;
      case 'all':
      default:
        // All trips should exclude cancelled bookings (like Airbnb)
        this.filteredBookings = this.bookings.filter(b => 
          b.bookingStatus !== BookingStatus.CANCELLED && 
          b.bookingStatus !== BookingStatus.REJECTED
        );
    }
  }

  selectTab(tab: 'all' | 'upcoming' | 'past' | 'cancelled'): void {
    this.selectedTab = tab;
    this.filterBookings();
  }

  viewBookingDetails(booking: Booking, event?: Event): void {
    // Prevent event propagation if event is provided
    if (event) {
      event.stopPropagation();
    }
    console.log('Navigating to booking detail:', booking.publicId);
    // Navigate to booking detail page with correct route
    this.router.navigate(['/booking', booking.publicId]);
  }

  openCancelModal(booking: Booking, event: Event): void {
    event.stopPropagation();
    this.bookingToCancel = booking;
    this.showCancelModal = true;
    this.cancelReason = '';
    document.body.style.overflow = 'hidden';
  }

  closeCancelModal(): void {
    this.showCancelModal = false;
    this.bookingToCancel = null;
    this.cancelReason = '';
    document.body.style.overflow = 'auto';
  }

  confirmCancel(): void {
    if (!this.bookingToCancel) return;

    this.cancelling = true;

    this.bookingService.cancelBooking(this.bookingToCancel.publicId, this.cancelReason).subscribe({
      next: (response) => {
        if (response.success) {
          this.loadBookings();
          this.closeCancelModal();
        }
        this.cancelling = false;
      },
      error: (error) => {
        this.error = 'Failed to cancel booking. Please try again.';
        this.cancelling = false;
        console.error('Error cancelling booking:', error);
      }
    });
  }

  getStatusColor(status: BookingStatus): string {
    switch (status) {
      case BookingStatus.CONFIRMED:
        return 'bg-green-100 text-green-800';
      case BookingStatus.PENDING:
        return 'bg-yellow-100 text-yellow-800';
      case BookingStatus.CHECKED_IN:
        return 'bg-blue-100 text-blue-800';
      case BookingStatus.CHECKED_OUT:
        return 'bg-gray-100 text-gray-800';
      case BookingStatus.CANCELLED:
        return 'bg-red-100 text-red-800';
      case BookingStatus.REJECTED:
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  getStatusLabel(status: BookingStatus): string {
    return status.charAt(0) + status.slice(1).toLowerCase().replace('_', ' ');
  }

  canCancel(booking: Booking): boolean {
    const checkInDate = new Date(booking.checkInDate);
    const now = new Date();
    
    return checkInDate > now && 
           booking.bookingStatus !== BookingStatus.CANCELLED &&
           booking.bookingStatus !== BookingStatus.REJECTED &&
           booking.bookingStatus !== BookingStatus.CHECKED_OUT;
  }

  changePage(page: number): void {
    this.currentPage = page;
    this.loadBookings();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}