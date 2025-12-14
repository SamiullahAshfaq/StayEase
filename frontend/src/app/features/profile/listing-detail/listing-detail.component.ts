import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { LandlordService } from '../../../core/services/landlord.service';
import { 
  Listing, 
  ListingStatus, 
  PropertyType, 
  RoomType,
  Booking,
  BookingStatus,
  LISTING_STATUS_LABELS,
  PROPERTY_TYPE_LABELS,
  ROOM_TYPE_LABELS,
  BOOKING_STATUS_LABELS
} from '../../../core/models/landlord.model';

@Component({
  selector: 'app-listing-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './listing-detail.component.html',
  styleUrls: ['./listing-detail.component.css']
})
export class ListingDetailComponent implements OnInit {
  private landlordService = inject(LandlordService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  // State
  listing = signal<Listing | null>(null);
  bookings = signal<Booking[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);
  
  // UI State
  activeTab = signal<'overview' | 'bookings' | 'analytics' | 'reviews'>('overview');
  selectedImageIndex = signal(0);
  showDeleteConfirm = signal(false);
  
  // Enums for template
  ListingStatus = ListingStatus;
  BookingStatus = BookingStatus;
  
  // Label mappings
  listingStatusLabels = LISTING_STATUS_LABELS;
  propertyTypeLabels = PROPERTY_TYPE_LABELS;
  roomTypeLabels = ROOM_TYPE_LABELS;
  bookingStatusLabels = BOOKING_STATUS_LABELS;

  constructor() {
    // Services are injected above
  }

  ngOnInit(): void {
    const listingId = this.route.snapshot.paramMap.get('id');
    if (listingId) {
      this.loadListing(listingId);
      this.loadBookings(listingId);
    }
  }

  loadListing(listingId: string): void {
    this.loading.set(true);
    this.error.set(null);
    
    this.landlordService.getListing(listingId).subscribe({
      next: (response) => {
        this.listing.set(response.data);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set('Failed to load listing details');
        this.loading.set(false);
        console.error('Error loading listing:', err);
      }
    });
  }

  loadBookings(listingId: string): void {
    this.landlordService.getMyBookings().subscribe({
      next: (response) => {
        // Filter bookings for this listing
        const allBookings = response.data;
        const listingBookings = allBookings.filter(
          booking => booking.listingPublicId === listingId
        );
        this.bookings.set(listingBookings);
      },
      error: (err) => {
        console.error('Error loading bookings:', err);
      }
    });
  }

  // Image Gallery
  selectImage(index: number): void {
    this.selectedImageIndex.set(index);
  }

  previousImage(): void {
    const listing = this.listing();
    if (!listing) return;
    
    const currentIndex = this.selectedImageIndex();
    const newIndex = currentIndex > 0 ? currentIndex - 1 : listing.images.length - 1;
    this.selectedImageIndex.set(newIndex);
  }

  nextImage(): void {
    const listing = this.listing();
    if (!listing) return;
    
    const currentIndex = this.selectedImageIndex();
    const newIndex = currentIndex < listing.images.length - 1 ? currentIndex + 1 : 0;
    this.selectedImageIndex.set(newIndex);
  }

  // Tab Navigation
  switchTab(tab: 'overview' | 'bookings' | 'analytics' | 'reviews'): void {
    this.activeTab.set(tab);
  }

  // Actions
  editListing(): void {
    const listing = this.listing();
    if (listing) {
      this.router.navigate(['/landlord/listings/edit', listing.publicId]);
    }
  }

  duplicateListing(): void {
    const listing = this.listing();
    if (listing) {
      // TODO: Implement duplicate logic
      console.log('Duplicate listing:', listing.publicId);
    }
  }

  toggleStatus(): void {
    const listing = this.listing();
    if (!listing) return;

    let action;
    if (listing.status === ListingStatus.ACTIVE) {
      action = this.landlordService.pauseListing(listing.publicId);
    } else if (listing.status === ListingStatus.PAUSED) {
      action = this.landlordService.activateListing(listing.publicId);
    } else if (listing.status === ListingStatus.DRAFT) {
      action = this.landlordService.publishListing(listing.publicId);
    } else {
      return; // Can't toggle other statuses
    }

    action.subscribe({
      next: (response) => {
        this.listing.set(response.data);
      },
      error: (err) => {
        console.error('Error toggling status:', err);
        alert('Failed to update listing status');
      }
    });
  }

  confirmDelete(): void {
    this.showDeleteConfirm.set(true);
  }

  cancelDelete(): void {
    this.showDeleteConfirm.set(false);
  }

  deleteListing(): void {
    const listing = this.listing();
    if (!listing) return;

    this.landlordService.deleteListing(listing.publicId).subscribe({
      next: () => {
        this.router.navigate(['/landlord/listings']);
      },
      error: (err) => {
        console.error('Error deleting listing:', err);
        alert('Failed to delete listing');
        this.showDeleteConfirm.set(false);
      }
    });
  }

  backToListings(): void {
    this.router.navigate(['/landlord/listings']);
  }

  // Booking Actions
  viewBooking(bookingId: string): void {
    this.router.navigate(['/landlord/bookings', bookingId]);
  }

  confirmBooking(booking: Booking): void {
    this.landlordService.confirmBooking(booking.publicId).subscribe({
      next: (response) => {
        // Update booking in list
        const updatedBookings = this.bookings().map(b => 
          b.publicId === booking.publicId ? response.data : b
        );
        this.bookings.set(updatedBookings);
      },
      error: (err) => {
        console.error('Error confirming booking:', err);
        alert('Failed to confirm booking');
      }
    });
  }

  rejectBooking(booking: Booking): void {
    this.landlordService.rejectBooking(booking.publicId).subscribe({
      next: (response) => {
        // Update booking in list
        const updatedBookings = this.bookings().map(b => 
          b.publicId === booking.publicId ? response.data : b
        );
        this.bookings.set(updatedBookings);
      },
      error: (err) => {
        console.error('Error rejecting booking:', err);
        alert('Failed to reject booking');
      }
    });
  }

  // Helper Methods
  getStatusClass(status: ListingStatus): string {
    switch (status) {
      case ListingStatus.ACTIVE:
        return 'status-success';
      case ListingStatus.DRAFT:
      case ListingStatus.PAUSED:
        return 'status-warning';
      case ListingStatus.SUSPENDED:
      case ListingStatus.REJECTED:
        return 'status-danger';
      default:
        return 'status-default';
    }
  }

  getBookingStatusClass(status: BookingStatus): string {
    switch (status) {
      case BookingStatus.CONFIRMED:
      case BookingStatus.PAID:
        return 'status-success';
      case BookingStatus.PENDING:
        return 'status-warning';
      case BookingStatus.CANCELLED:
      case BookingStatus.REJECTED:
        return 'status-danger';
      default:
        return 'status-default';
    }
  }

  getActionButtonText(): string {
    const listing = this.listing();
    if (!listing) return '';

    switch (listing.status) {
      case ListingStatus.ACTIVE:
        return 'Pause Listing';
      case ListingStatus.PAUSED:
        return 'Activate Listing';
      case ListingStatus.DRAFT:
        return 'Publish Listing';
      default:
        return '';
    }
  }

  canToggleStatus(): boolean {
    const listing = this.listing();
    if (!listing) return false;
    
    return [ListingStatus.ACTIVE, ListingStatus.PAUSED, ListingStatus.DRAFT].includes(listing.status);
  }

  calculateOccupancyRate(): number {
    const listing = this.listing();
    if (!listing || !listing.stats) return 0;
    
    const totalDays = 30; // Last 30 days
    const bookedDays = listing.stats.bookedDays || 0;
    return Math.round((bookedDays / totalDays) * 100);
  }

  getUpcomingBookings(): Booking[] {
    const now = new Date();
    return this.bookings().filter(booking => {
      const checkIn = new Date(booking.checkInDate);
      return checkIn > now && [BookingStatus.CONFIRMED, BookingStatus.PAID].includes(booking.status);
    }).slice(0, 5);
  }

  getPendingBookings(): Booking[] {
    return this.bookings().filter(booking => 
      booking.status === BookingStatus.PENDING
    ).slice(0, 5);
  }

  formatPrice(price: number): string {
    return `$${price.toLocaleString()}`;
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  }

  formatDateTime(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}
