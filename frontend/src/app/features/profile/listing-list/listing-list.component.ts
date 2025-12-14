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

@Component({
  selector: 'app-listing-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './listing-list.component.html',
  styleUrl: './listing-list.component.css'
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
  sortBy = signal<'title' | 'createdAt' | 'basePrice' | 'bookingCount'>('createdAt');
  sortDirection = signal<'asc' | 'desc'>('desc');
  viewMode = signal<'grid' | 'list'>('grid');

  // Labels
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
      let aValue: any = a[this.sortBy()];
      let bValue: any = b[this.sortBy()];

      if (this.sortBy() === 'createdAt') {
        aValue = new Date(aValue).getTime();
        bValue = new Date(bValue).getTime();
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

  changeSortBy(sortBy: 'title' | 'createdAt' | 'basePrice' | 'bookingCount') {
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
    this.router.navigate(['/profile/listings', publicId, 'edit']);
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
        return 'status-success';
      case ListingStatus.PENDING_APPROVAL:
      case ListingStatus.DRAFT:
        return 'status-warning';
      case ListingStatus.SUSPENDED:
      case ListingStatus.REJECTED:
        return 'status-danger';
      case ListingStatus.PAUSED:
      case ListingStatus.INACTIVE:
        return 'status-default';
      default:
        return 'status-default';
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
}
