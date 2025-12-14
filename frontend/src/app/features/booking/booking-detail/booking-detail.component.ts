import { Component, OnInit, ApplicationRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { BookingService } from '../services/booking.service';
import { Booking, BookingStatus } from '../models/booking.model';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-booking-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './booking-detail.component.html'
})
export class BookingDetailComponent implements OnInit {
    get currentUrl(): string {
      return window.location.href;
    }

    get minCheckInDate(): string {
      // Minimum check-in date is 2 days from now
      const date = new Date(Date.now() + 86400000 * 2);
      return date.toISOString().split('T')[0];
    }

  booking: Booking | null = null;
  loading = false;
  error: string | null = null;

  // Share modal
  showShareModal = false;
  copied = false;

  // Cancel modal
  showCancelModal = false;
  cancelReason = '';
  cancelling = false;

  // Edit modal
  showEditModal = false;
  editCheckIn = '';
  editCheckOut = '';
  editGuests = 1;
  editing = false;

  constructor(
    private bookingService: BookingService,
    private route: ActivatedRoute,
    private router: Router,
    private appRef: ApplicationRef
  ) {}

  ngOnInit(): void {
    const publicId = this.route.snapshot.paramMap.get('id');
    console.log('Route parameter id:', publicId);
    if (publicId) {
      this.loadBooking(publicId);
    } else {
      this.error = 'Booking ID not found in route';
      console.error('No booking ID in route parameters');
    }
  }

  loadBooking(publicId: string): void {
    console.log('loadBooking() called with publicId:', publicId);
    this.loading = true;
    this.error = null;

    this.bookingService.getBookingById(publicId).subscribe({
      next: (response) => {
        console.log('Booking response received:', response);
        if (response.success && response.data) {
          this.booking = response.data;
          console.log('Booking loaded successfully:', this.booking);
        } else {
          this.error = 'Booking not found';
          console.error('Booking not found in response');
        }
        this.loading = false;
        console.log('Loading set to false');
        this.appRef.tick(); // Trigger change detection
      },
      error: (error) => {
        this.error = 'Failed to load booking details. Please try again.';
        this.loading = false;
        console.log('Loading set to false (error)');
        this.appRef.tick(); // Trigger change detection
        console.error('Error loading booking:', error);
      }
    });
  }

  getStatusColor(status: BookingStatus): string {
    switch (status) {
      case BookingStatus.CONFIRMED:
        return 'bg-green-100 text-green-800 border-green-200';
      case BookingStatus.PENDING:
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case BookingStatus.CHECKED_IN:
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case BookingStatus.CHECKED_OUT:
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case BookingStatus.CANCELLED:
        return 'bg-red-100 text-red-800 border-red-200';
      case BookingStatus.REJECTED:
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  }

  getStatusLabel(status: BookingStatus): string {
    return status.charAt(0) + status.slice(1).toLowerCase().replace('_', ' ');
  }

  canCancel(): boolean {
    if (!this.booking) return false;

    const checkInDate = new Date(this.booking.checkInDate);
    const now = new Date();

    return checkInDate > now &&
           this.booking.bookingStatus !== BookingStatus.CANCELLED &&
           this.booking.bookingStatus !== BookingStatus.REJECTED &&
           this.booking.bookingStatus !== BookingStatus.CHECKED_OUT;
  }

  viewListing(): void {
    if (this.booking) {
      this.router.navigate(['/listings', this.booking.listingPublicId]);
    }
  }

  toggleShare(): void {
    this.showShareModal = !this.showShareModal;
    if (this.showShareModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
  }

  copyLink(): void {
    const url = window.location.href;
    navigator.clipboard.writeText(url).then(() => {
      this.copied = true;
      setTimeout(() => {
        this.copied = false;
      }, 2000);
    });
  }

  downloadConfirmation(): void {
    // TODO: Implement PDF download
    console.log('Download confirmation');
  }

  contactHost(): void {
    // TODO: Implement chat functionality
    console.log('Contact host');
  }

  reportIssue(): void {
    // TODO: Implement report functionality
    console.log('Report issue');
  }

  // Cancel booking methods
  openCancelModal(): void {
    console.log('Opening cancel modal');
    this.showCancelModal = true;
    this.cancelReason = '';
    document.body.style.overflow = 'hidden';
    console.log('showCancelModal set to:', this.showCancelModal);
  }

  closeCancelModal(): void {
    console.log('Closing cancel modal');
    this.showCancelModal = false;
    this.cancelReason = '';
    document.body.style.overflow = 'auto';
  }

  confirmCancel(): void {
    if (!this.booking) return;

    this.cancelling = true;
    this.error = null;

    this.bookingService.cancelBooking(this.booking.publicId, this.cancelReason).subscribe({
      next: (response) => {
        console.log('Cancel response:', response);
        this.cancelling = false;
        if (response.success) {
          // Reload booking to show cancelled status
          this.loadBooking(this.booking!.publicId);
          this.closeCancelModal();
        } else {
          this.error = 'Failed to cancel booking. Please try again.';
        }
      },
      error: (error) => {
        this.error = 'Failed to cancel booking. Please try again.';
        this.cancelling = false;
        console.error('Error cancelling booking:', error);
      }
    });
  }

  // Edit booking methods
  openEditModal(): void {
    if (!this.booking) return;

    this.editCheckIn = this.booking.checkInDate;
    this.editCheckOut = this.booking.checkOutDate;
    this.editGuests = this.booking.numberOfGuests;
    this.showEditModal = true;
    document.body.style.overflow = 'hidden';
  }

  closeEditModal(): void {
    this.showEditModal = false;
    this.editCheckIn = '';
    this.editCheckOut = '';
    this.editGuests = 1;
    document.body.style.overflow = 'auto';
  }

  canEdit(): boolean {
    if (!this.booking) return false;

    const checkInDate = new Date(this.booking.checkInDate);
    const now = new Date();

    // Can edit if check-in is at least 2 days away and booking is confirmed
    const twoDaysFromNow = new Date(now.getTime() + (2 * 24 * 60 * 60 * 1000));

    return checkInDate > twoDaysFromNow &&
           this.booking.bookingStatus === BookingStatus.CONFIRMED;
  }

  confirmEdit(): void {
    if (!this.booking) return;

    // Validate dates
    const checkIn = new Date(this.editCheckIn);
    const checkOut = new Date(this.editCheckOut);
    const now = new Date();

    if (checkIn <= now) {
      this.error = 'Check-in date must be in the future';
      return;
    }

    if (checkOut <= checkIn) {
      this.error = 'Check-out date must be after check-in date';
      return;
    }

    this.editing = true;
    this.error = null;

    // For now, we'll just show a message since we don't have an update endpoint
    // In a real app, you would call bookingService.updateBooking()
    setTimeout(() => {
      if (this.booking) {
        this.booking.checkInDate = this.editCheckIn;
        this.booking.checkOutDate = this.editCheckOut;
        this.booking.numberOfGuests = this.editGuests;

        // Recalculate nights
        const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
        this.booking.numberOfNights = nights;

        this.closeEditModal();
      }
      this.editing = false;
    }, 500);
  }
}
