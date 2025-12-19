import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { LandlordService } from '../services/landlord.service';
import {
  Listing,
  ListingStatus,
  LISTING_STATUS_LABELS,
  PROPERTY_TYPE_LABELS,
  ROOM_TYPE_LABELS
} from '../models/landlord.model';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-listing-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './listing-list.component.html'
})
export class ListingListComponent implements OnInit {
  private landlordService = inject(LandlordService);
  private router = inject(Router);

  // State
  listings = signal<Listing[]>([]);
  filteredListings = signal<Listing[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);

  // Filters
  selectedStatus = signal<ListingStatus | 'ALL'>('ALL');
  searchKeyword = signal('');
  sortBy = signal<'title' | 'createdAt' | 'pricePerNight' | 'bookingCount'>('createdAt');
  sortDirection = signal<'asc' | 'desc'>('desc');
  viewMode = signal<'grid' | 'list'>('grid');

  // Labels
  ListingStatus = ListingStatus;
  listingStatusLabels = LISTING_STATUS_LABELS;
  propertyTypeLabels = PROPERTY_TYPE_LABELS;
  roomTypeLabels = ROOM_TYPE_LABELS;

  // Stats
  totalListings = signal(0);
  activeListings = signal(0);
  draftListings = signal(0);
  pausedListings = signal(0);

  // Status options
  statusOptions = [
    { value: 'ALL', label: 'All Listings' },
    { value: ListingStatus.ACTIVE, label: 'Active' },
    { value: ListingStatus.DRAFT, label: 'Draft' },
    { value: ListingStatus.PAUSED, label: 'Paused' },
    { value: ListingStatus.PENDING_APPROVAL, label: 'Pending Approval' },
    { value: ListingStatus.SUSPENDED, label: 'Suspended' },
    { value: ListingStatus.REJECTED, label: 'Rejected' },
    { value: ListingStatus.INACTIVE, label: 'Inactive' }
  ];

  ngOnInit() {
    this.loadListings();
  }

  loadListings() {
    this.loading.set(true);
    this.error.set(null);

    this.landlordService.getMyListings().subscribe({
      next: (response) => {
        console.log('[ListingList] API Response:', response);
        console.log('[ListingList] Listings data:', response.data);
        if (response.data && response.data.length > 0) {
          console.log('[ListingList] First listing images:', response.data[0].images);
          console.log('[ListingList] First listing coverImageUrl:', response.data[0].coverImageUrl);
          console.log('[ListingList] First listing pricePerNight:', response.data[0].pricePerNight);
          console.log('[ListingList] First listing full object:', JSON.stringify(response.data[0], null, 2));
        }
        this.listings.set(response.data);
        this.applyFilters();
        this.updateStats();
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error loading listings:', err);
        this.error.set('Failed to load listings. Please try again.');
        this.loading.set(false);
      }
    });
  }

  applyFilters() {
    let filtered = [...this.listings()];

    // Status filter
    if (this.selectedStatus() !== 'ALL') {
      filtered = filtered.filter(l => l.status === this.selectedStatus());
    }

    // Search filter
    const keyword = this.searchKeyword().toLowerCase();
    if (keyword) {
      filtered = filtered.filter(l =>
        l.title.toLowerCase().includes(keyword) ||
        l.city.toLowerCase().includes(keyword) ||
        l.address.toLowerCase().includes(keyword)
      );
    }

    // Sort
    filtered.sort((a, b) => {
      let aValue: string | number = a[this.sortBy()];
      let bValue: string | number = b[this.sortBy()];

      if (this.sortBy() === 'createdAt') {
        aValue = new Date(aValue as string).getTime();
        bValue = new Date(bValue as string).getTime();
      }

      if (this.sortDirection() === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    this.filteredListings.set(filtered);
  }

  updateStats() {
    const listings = this.listings();
    this.totalListings.set(listings.length);
    this.activeListings.set(listings.filter(l => l.status === ListingStatus.ACTIVE).length);
    this.draftListings.set(listings.filter(l => l.status === ListingStatus.DRAFT).length);
    this.pausedListings.set(listings.filter(l => l.status === ListingStatus.PAUSED).length);
  }

  filterByStatus(status: ListingStatus | 'ALL') {
    this.selectedStatus.set(status);
    this.applyFilters();
  }

  search(keyword: string) {
    this.searchKeyword.set(keyword);
    this.applyFilters();
  }

  showAll() {
    this.selectedStatus.set('ALL');
    this.searchKeyword.set('');
    this.applyFilters();
  }

  changeSortBy(sortBy: 'title' | 'createdAt' | 'pricePerNight' | 'bookingCount') {
    if (this.sortBy() === sortBy) {
      // Toggle direction
      this.sortDirection.set(this.sortDirection() === 'asc' ? 'desc' : 'asc');
    } else {
      this.sortBy.set(sortBy);
      this.sortDirection.set('desc');
    }
    this.applyFilters();
  }

  createListing() {
    this.router.navigate(['/profile/listings/create']);
  }

  viewListing(publicId: string) {
    this.router.navigate(['/profile/listings', publicId]);
  }

  editListing(publicId: string, event: Event) {
    event.stopPropagation();
    
    // Find the listing to check its status
    const listing = this.filteredListings().find(l => l.publicId === publicId);
    
    // If it's a DRAFT, resume in the create form
    // Otherwise, use the regular edit form
    if (listing && listing.status === ListingStatus.DRAFT) {
      this.router.navigate(['/profile/listings/create', publicId]);
    } else {
      this.router.navigate(['/profile/listings', publicId, 'edit']);
    }
  }

  duplicateListing(publicId: string, event: Event) {
    event.stopPropagation();

    if (confirm('Create a copy of this listing?')) {
      // TODO: Implement duplicate functionality
      console.log('Duplicate listing:', publicId);
    }
  }

  toggleListingStatus(listing: Listing, event: Event) {
    event.stopPropagation();

    if (listing.status === ListingStatus.ACTIVE) {
      this.pauseListing(listing.publicId);
    } else if (listing.status === ListingStatus.PAUSED) {
      this.activateListing(listing.publicId);
    } else if (listing.status === ListingStatus.DRAFT) {
      this.publishListing(listing.publicId);
    }
  }

  pauseListing(publicId: string) {
    this.landlordService.pauseListing(publicId).subscribe({
      next: () => {
        this.loadListings();
      },
      error: (err) => {
        console.error('Error pausing listing:', err);
        alert('Failed to pause listing');
      }
    });
  }

  activateListing(publicId: string) {
    this.landlordService.activateListing(publicId).subscribe({
      next: () => {
        this.loadListings();
      },
      error: (err) => {
        console.error('Error activating listing:', err);
        alert('Failed to activate listing');
      }
    });
  }

  publishListing(publicId: string) {
    if (confirm('Publish this listing? It will be visible to guests.')) {
      this.landlordService.publishListing(publicId).subscribe({
        next: () => {
          this.loadListings();
        },
        error: (err) => {
          console.error('Error publishing listing:', err);
          alert('Failed to publish listing');
        }
      });
    }
  }

  deleteListing(publicId: string, event: Event) {
    event.stopPropagation();

    if (confirm('Are you sure you want to delete this listing? This action cannot be undone.')) {
      this.landlordService.deleteListing(publicId).subscribe({
        next: () => {
          this.loadListings();
        },
        error: (err) => {
          console.error('Error deleting listing:', err);
          alert('Failed to delete listing');
        }
      });
    }
  }

  getStatusClass(status: ListingStatus): string {
    switch (status) {
      case ListingStatus.ACTIVE:
        return 'bg-green-100 text-green-800 border border-green-200';
      case ListingStatus.PENDING_APPROVAL:
        return 'bg-blue-100 text-blue-800 border border-blue-200';
      case ListingStatus.DRAFT:
        return 'bg-yellow-100 text-yellow-800 border border-yellow-200';
      case ListingStatus.SUSPENDED:
      case ListingStatus.REJECTED:
        return 'bg-red-100 text-red-800 border border-red-200';
      case ListingStatus.PAUSED:
      case ListingStatus.INACTIVE:
        return 'bg-gray-100 text-gray-800 border border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border border-gray-200';
    }
  }

  getActionButtonText(status: ListingStatus): string {
    switch (status) {
      case ListingStatus.ACTIVE:
        return 'Pause';
      case ListingStatus.PAUSED:
        return 'Activate';
      case ListingStatus.DRAFT:
        return 'Publish';
      default:
        return 'View';
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

  /**
   * Get full image URL by prepending backend URL if needed
   */
  getImageUrl(url: string | undefined): string {
    if (!url) {
      return '';
    }
    // If URL is already absolute (starts with http:// or https://), return as is
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    // If URL is relative (starts with /), prepend backend URL
    if (url.startsWith('/')) {
      return environment.apiUrl.replace('/api', '') + url;
    }
    // Otherwise, assume it's a relative path and prepend backend URL
    return environment.apiUrl.replace('/api', '') + '/' + url;
  }

  /**
   * Calculate completion percentage for a listing
   * Returns a number between 0-100 indicating how complete the listing is
   */
  getCompletionPercentage(listing: Listing): number {
    let completed = 0;
    const totalFields = 12; // Total number of important fields

    // Essential information (4 fields)
    if (listing.title && listing.title.trim().length > 0) completed++;
    if (listing.description && listing.description.trim().length >= 50) completed++; // At least 50 chars
    if (listing.address && listing.address.trim().length > 0) completed++;
    if (listing.city && listing.city.trim().length > 0) completed++;

    // Pricing (1 field)
    if (listing.pricePerNight > 0) completed++;

    // Property details (4 fields)
    if (listing.bedrooms > 0) completed++;
    if (listing.bathrooms > 0) completed++;
    if (listing.maxGuests > 0) completed++;
    if (listing.propertyType) completed++;

    // Media (1 field - at least 3 photos recommended)
    if (listing.images && listing.images.length >= 3) {
      completed++;
    } else if (listing.coverImageUrl || (listing.images && listing.images.length > 0)) {
      completed += 0.5; // Half credit for having some images
    }

    // Amenities (1 field - at least 3 amenities)
    if (listing.amenities && listing.amenities.length >= 3) {
      completed++;
    } else if (listing.amenities && listing.amenities.length > 0) {
      completed += 0.5; // Half credit for having some amenities
    }

    // Location coordinates (1 field)
    if (listing.latitude && listing.longitude) completed++;

    return Math.round((completed / totalFields) * 100);
  }

  /**
   * Check if a listing is incomplete (less than 100% complete)
   */
  isListingIncomplete(listing: Listing): boolean {
    return this.getCompletionPercentage(listing) < 100;
  }

  /**
   * Get missing fields for a listing to help landlord complete it
   */
  getMissingFields(listing: Listing): string[] {
    const missing: string[] = [];

    if (!listing.title || listing.title.trim().length === 0) {
      missing.push('Title');
    }
    if (!listing.description || listing.description.trim().length < 50) {
      missing.push('Description (at least 50 characters)');
    }
    if (!listing.address || listing.address.trim().length === 0) {
      missing.push('Address');
    }
    if (!listing.city || listing.city.trim().length === 0) {
      missing.push('City');
    }
    if (listing.pricePerNight <= 0) {
      missing.push('Price per night');
    }
    if (listing.bedrooms <= 0) {
      missing.push('Number of bedrooms');
    }
    if (listing.bathrooms <= 0) {
      missing.push('Number of bathrooms');
    }
    if (listing.maxGuests <= 0) {
      missing.push('Maximum guests');
    }
    if (!listing.propertyType) {
      missing.push('Property type');
    }
    if (!listing.images || listing.images.length < 3) {
      missing.push('Photos (at least 3 high-quality images)');
    }
    if (!listing.amenities || listing.amenities.length < 3) {
      missing.push('Amenities (at least 3)');
    }
    if (!listing.latitude || !listing.longitude) {
      missing.push('Map location');
    }

    return missing;
  }

  /**
   * Get completion status badge color
   */
  getCompletionStatusClass(percentage: number): string {
    if (percentage >= 100) return 'bg-green-100 text-green-800 border-green-300';
    if (percentage >= 75) return 'bg-blue-100 text-blue-800 border-blue-300';
    if (percentage >= 50) return 'bg-yellow-100 text-yellow-800 border-yellow-300';
    return 'bg-red-100 text-red-800 border-red-300';
  }

  /**
   * Get completion status text
   */
  getCompletionStatusText(percentage: number): string {
    if (percentage >= 100) return 'Complete';
    if (percentage >= 75) return 'Almost Done';
    if (percentage >= 50) return 'In Progress';
    return 'Needs Work';
  }
}
