import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { BookingService } from '../services/booking.service';
import { Booking, BookingStatus } from '../models/booking.model';

@Component({
  selector: 'app-booking-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './booking-detail.component.html'
})
export class BookingDetailComponent implements OnInit {
    get currentUrl(): string {
      return window.location.href;
    }
  booking: Booking | null = null;
  loading = false;
  error: string | null = null;

  // Share modal
  showShareModal = false;
  copied = false;

  constructor(
    private bookingService: BookingService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    const publicId = this.route.snapshot.paramMap.get('publicId');
    if (publicId) {
      this.loadBooking(publicId);
    }
  }

  loadBooking(publicId: string): void {
    this.loading = true;
    this.error = null;

    this.bookingService.getBookingById(publicId).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.booking = response.data;
        }
        this.loading = false;
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
}