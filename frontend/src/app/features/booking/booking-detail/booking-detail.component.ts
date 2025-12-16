import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { BookingService } from '../services/booking.service';
import { Booking, BookingStatus, BookingAddon } from '../models/booking.model';
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
  editAddons: BookingAddon[] = [];
  editing = false;

  constructor(
    private bookingService: BookingService,
    private route: ActivatedRoute,
    private router: Router,
    private cdr: ChangeDetectorRef
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
          this.loading = false;
        } else {
          this.error = 'Booking not found';
          console.error('Booking not found in response');
          this.loading = false;
        }
      },
      error: (error) => {
        this.error = 'Failed to load booking details. Please try again.';
        this.loading = false;
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
    // Deep copy addons to avoid modifying original
    this.editAddons = this.booking.addons ? JSON.parse(JSON.stringify(this.booking.addons)) : [];
    this.showEditModal = true;
    document.body.style.overflow = 'hidden';
  }

  closeEditModal(): void {
    console.log('=== CLOSE EDIT MODAL CALLED ===');
    console.log('Current showEditModal:', this.showEditModal);
    console.log('Current editing:', this.editing);
    
    this.showEditModal = false;
    this.editCheckIn = '';
    this.editCheckOut = '';
    this.editGuests = 1;
    this.editAddons = [];
    this.error = null;
    document.body.style.overflow = 'auto';
    
    console.log('Modal closed, showEditModal set to:', this.showEditModal);
    
    // Force change detection to update the template
    this.cdr.detectChanges();
    console.log('Change detection triggered');
    console.log('=== CLOSE EDIT MODAL COMPLETE ===');
  }

  canEdit(): boolean {
    if (!this.booking) return false;

    const checkInDate = new Date(this.booking.checkInDate);
    const now = new Date();

    // Can edit if check-in is in the future and booking is confirmed or pending
    // (Cannot edit if already checked in, checked out, cancelled, or rejected)
    return checkInDate > now &&
           (this.booking.bookingStatus === BookingStatus.CONFIRMED ||
            this.booking.bookingStatus === BookingStatus.PENDING);
  }

  toggleAddon(addon: BookingAddon): void {
    const index = this.editAddons.findIndex(a => a.name === addon.name);
    if (index > -1) {
      // Remove addon
      this.editAddons.splice(index, 1);
    } else {
      // Add addon
      this.editAddons.push({ ...addon });
    }
  }

  isAddonSelected(addon: BookingAddon): boolean {
    return this.editAddons.some(a => a.name === addon.name);
  }

  calculateEditTotal(): number {
    if (!this.booking) return 0;

    // Calculate base price (nights * price per night)
    const checkIn = new Date(this.editCheckIn);
    const checkOut = new Date(this.editCheckOut);
    const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
    const pricePerNight = this.booking.totalPrice / this.booking.numberOfNights;
    const basePrice = nights * pricePerNight;

    // Add addons total
    const addonsTotal = this.editAddons.reduce((sum, addon) => sum + (addon.price * addon.quantity), 0);

    return basePrice + addonsTotal;
  }

  confirmEdit(): void {
    if (!this.booking) return;

    console.log('=== CONFIRM EDIT START ===');
    console.log('Current booking:', this.booking);
    console.log('Edit values:', {
      checkIn: this.editCheckIn,
      checkOut: this.editCheckOut,
      guests: this.editGuests,
      addons: this.editAddons
    });

    // Validate dates
    const checkIn = new Date(this.editCheckIn);
    const checkOut = new Date(this.editCheckOut);
    const now = new Date();

    if (checkIn <= now) {
      this.error = 'Check-in date must be in the future';
      console.error('Validation failed: Check-in date in past');
      return;
    }

    if (checkOut <= checkIn) {
      this.error = 'Check-out date must be after check-in date';
      console.error('Validation failed: Check-out before check-in');
      return;
    }

    console.log('Validation passed, setting editing = true');
    this.editing = true;
    this.error = null;

    // Call the real API to update booking
    const updateData = {
      checkInDate: this.editCheckIn,
      checkOutDate: this.editCheckOut,
      numberOfGuests: this.editGuests,
      specialRequests: this.booking.specialRequests,
      addons: this.editAddons
    };

    console.log('Sending update request with data:', updateData);
    console.log('Booking publicId:', this.booking.publicId);

    this.bookingService.updateBooking(this.booking.publicId, updateData).subscribe({
      next: (response) => {
        console.log('=== API RESPONSE RECEIVED ===');
        console.log('Response:', response);
        console.log('Response.success:', response.success);
        console.log('Response.data:', response.data);
        
        if (response.success && response.data) {
          console.log('Response is successful, updating booking');
          // Update the booking with the response from server
          this.booking = response.data;
          
          console.log('Setting editing = false');
          this.editing = false;
          
          console.log('Calling closeEditModal()');
          this.closeEditModal();
          
          console.log('=== EDIT COMPLETE SUCCESS ===');
        } else {
          console.error('Response success is false or no data');
          this.editing = false;
        }
      },
      error: (err) => {
        console.error('=== API ERROR ===');
        console.error('Error updating booking:', err);
        console.error('Error status:', err.status);
        console.error('Error message:', err.error?.message);
        this.error = err.error?.message || 'Failed to update booking. Please try again.';
        this.editing = false;
        console.log('=== EDIT COMPLETE ERROR ===');
      }
    });
    
    console.log('Subscribe called, waiting for response...');
  }
}
