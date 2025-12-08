import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { BookingService } from '../services/booking.service';
import { Booking, BookingStatus } from '../models/booking.model';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-booking-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './booking-list.component.html'
})
export class BookingListComponent implements OnInit {
  bookings: Booking[] = [];
  filteredBookings: Booking[] = [];
  loading = false;
  error: string | null = null;

  // Pagination
  currentPage = 0;
  pageSize = 10;
  totalPages = 0;
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
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadBookings();
  }

  loadBookings(): void {
    this.loading = true;
    this.error = null;

    this.bookingService.getMyBookings(this.currentPage, this.pageSize).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.bookings = response.data.content;
          this.currentPage = response.data.number;
          this.pageSize = response.data.size;
          this.totalPages = response.data.totalPages;
          this.totalElements = response.data.totalElements;
          this.filterBookings();
        }
        this.loading = false;
      },
      error: (error) => {
        this.error = 'Failed to load bookings. Please try again.';
        this.loading = false;
        console.error('Error loading bookings:', error);
      }
    });
  }

  filterBookings(): void {
    const now = new Date();
    
    switch (this.selectedTab) {
      case 'upcoming':
        this.filteredBookings = this.bookings.filter(b => 
          new Date(b.checkInDate) > now && 
          b.bookingStatus !== BookingStatus.CANCELLED && 
          b.bookingStatus !== BookingStatus.REJECTED
        );
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
      default:
        this.filteredBookings = [...this.bookings];
    }
  }

  selectTab(tab: 'all' | 'upcoming' | 'past' | 'cancelled'): void {
    this.selectedTab = tab;
    this.filterBookings();
  }

  viewBookingDetails(booking: Booking): void {
    this.router.navigate(['/bookings', booking.publicId]);
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