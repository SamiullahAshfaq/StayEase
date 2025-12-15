import { Component, OnInit, Inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule, DOCUMENT } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ListingService } from '../services/listing.service';
import { Listing } from '../models/listing.model';
import { ImageUrlHelper } from '../../../shared/utils/image-url.helper';

interface Review {
  id: string;
  guestName: string;
  guestAvatar: string;
  rating: number;
  date: string;
  comment: string;
}

interface Host {
  name: string;
  avatar: string;
  joinedDate: string;
  verified: boolean;
  responseRate: number;
  responseTime: string;
}

@Component({
  selector: 'app-listing-detail',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './listing-detail.component.html'
})
export class ListingDetailComponent implements OnInit {
  listing: Listing | null = null;
  loading = false;
  error: string | null = null;

  // Image gallery
  showAllPhotos = false;
  selectedImageIndex = 0;

  // Booking
  checkIn: string = '';
  checkOut: string = '';
  guests = 1;

  // Share & Save
  showShareModal = false;
  copied = false;
  today: string;
  currentUrl: string;

  // Host info
  host: Host = {
    name: 'John Doe',
    avatar: 'https://i.pravatar.cc/150?img=12',
    joinedDate: 'January 2020',
    verified: true,
    responseRate: 98,
    responseTime: 'within an hour'
  };

  // Reviews (mock data)
  reviews: Review[] = [
    {
      id: '1',
      guestName: 'Sarah Johnson',
      guestAvatar: 'https://i.pravatar.cc/150?img=5',
      rating: 5,
      date: 'December 2024',
      comment: 'Amazing place! The views were breathtaking and the host was incredibly responsive. Would definitely stay here again.'
    },
    {
      id: '2',
      guestName: 'Michael Chen',
      guestAvatar: 'https://i.pravatar.cc/150?img=8',
      rating: 5,
      date: 'November 2024',
      comment: 'Perfect location and beautifully maintained property. Everything was exactly as described. Highly recommend!'
    },
    {
      id: '3',
      guestName: 'Emma Davis',
      guestAvatar: 'https://i.pravatar.cc/150?img=9',
      rating: 4,
      date: 'November 2024',
      comment: 'Great stay overall. The place was clean and comfortable. Only minor issue was the wifi speed, but everything else was excellent.'
    },
    {
      id: '4',
      guestName: 'David Martinez',
      guestAvatar: 'https://i.pravatar.cc/150?img=13',
      rating: 5,
      date: 'October 2024',
      comment: 'Exceptional hospitality and a stunning property. The attention to detail was impressive. Will definitely be back!'
    }
  ];

  // Show more controls
  showAllAmenities = false;
  showAllReviews = false;

  // Similar listings (will be populated from service)
  similarListings: Listing[] = [];

  // Rating breakdown
  get ratingBreakdown() {
    if (!this.listing) return null;

    return {
      cleanliness: 4.9,
      communication: 5.0,
      checkIn: 4.8,
      accuracy: 4.9,
      location: 4.7,
      value: 4.8
    };
  }

  constructor(
    private listingService: ListingService,
    private route: ActivatedRoute,
    private router: Router,
    @Inject(DOCUMENT) private document: Document,
    private cdr: ChangeDetectorRef
  ) {
    this.today = new Date().toISOString().split('T')[0];
    this.currentUrl = this.document.location.href;
  }

  ngOnInit(): void {
    const publicId = this.route.snapshot.paramMap.get('id');
    if (publicId) {
      this.loadListing(publicId);
    }
  }

  loadListing(publicId: string): void {
    this.loading = true;
    this.error = null;

    this.listingService.getListingById(publicId).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.listing = response.data;
          this.loadSimilarListings();
          console.log('Listing loaded:', this.listing.publicId);
        }
        this.loading = false;
        // Trigger change detection to ensure UI updates
        this.cdr.detectChanges();
      },
      error: (error) => {
        this.error = 'Failed to load listing. Please try again.';
        this.loading = false;
        console.error('Error loading listing:', error);
        this.cdr.detectChanges();
      }
    });
  }

  loadSimilarListings(): void {
    if (!this.listing) return;

    // Get similar listings based on category
    this.listingService.searchListings({
      categories: [this.listing.category],
      page: 0,
      size: 4
    }).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          // Filter out the current listing
          this.similarListings = response.data.content
            .filter(l => l.publicId !== this.listing?.publicId)
            .slice(0, 3);
          console.log('Similar listings loaded:', this.similarListings.length);
          // Trigger change detection for similar listings
          this.cdr.detectChanges();
        }
      },
      error: (error) => {
        console.error('Error loading similar listings:', error);
      }
    });
  }

  openPhotoGallery(index: number = 0): void {
    this.selectedImageIndex = index;
    this.showAllPhotos = true;
    document.body.style.overflow = 'hidden';
  }

  closePhotoGallery(): void {
    this.showAllPhotos = false;
    document.body.style.overflow = 'auto';
  }

  nextImage(): void {
    if (this.listing && this.selectedImageIndex < this.listing.images.length - 1) {
      this.selectedImageIndex++;
    }
  }

  previousImage(): void {
    if (this.selectedImageIndex > 0) {
      this.selectedImageIndex--;
    }
  }

  proceedToBooking(): void {
    if (!this.checkIn || !this.checkOut) {
      alert('Please select check-in and check-out dates');
      return;
    }

    if (!this.listing?.publicId) {
      alert('Listing information not available');
      return;
    }

    console.log('Navigating to booking create with:', {
      listingId: this.listing.publicId,
      checkIn: this.checkIn,
      checkOut: this.checkOut,
      guests: this.guests
    });

    this.router.navigate(['/booking/create', this.listing.publicId], {
      queryParams: {
        listingId: this.listing.publicId,
        checkIn: this.checkIn,
        checkOut: this.checkOut,
        guests: this.guests
      }
    });
  }

  calculateNights(): number {
    if (!this.checkIn || !this.checkOut) return 0;

    const start = new Date(this.checkIn);
    const end = new Date(this.checkOut);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return diffDays;
  }

  calculateTotal(): number {
    if (!this.listing) return 0;
    const nights = this.calculateNights();
    return nights * this.listing.pricePerNight;
  }

  toggleShare(): void {
    this.showShareModal = !this.showShareModal;
  }

  copyLink(): void {
    const url = this.document.location.href;
    navigator.clipboard.writeText(url).then(() => {
      this.copied = true;
      setTimeout(() => {
        this.copied = false;
      }, 2000);
    });
  }

  share(platform: string): void {
    const url = this.document.location.href;
    const title = this.listing?.title || 'Check out this listing';

    let shareUrl = '';
    switch (platform) {
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
        break;
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`;
        break;
      case 'whatsapp':
        shareUrl = `https://wa.me/?text=${encodeURIComponent(title + ' ' + url)}`;
        break;
      case 'email':
        shareUrl = `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(url)}`;
        break;
    }

    if (shareUrl) {
      window.open(shareUrl, '_blank');
    }
  }

  saveListing(): void {
    // TODO: Implement save/favorite functionality
    console.log('Save listing');
  }

  reportListing(): void {
    // TODO: Implement report functionality
    console.log('Report listing');
  }

  toggleAllAmenities(): void {
    this.showAllAmenities = !this.showAllAmenities;
  }

  toggleAllReviews(): void {
    this.showAllReviews = !this.showAllReviews;
  }

  getAmenityIcon(amenity: string): string {
    const amenityLower = amenity.toLowerCase();

    if (amenityLower.includes('wifi') || amenityLower.includes('internet')) {
      return 'M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0';
    }
    if (amenityLower.includes('kitchen')) {
      return 'M3 6h18M3 10h18M3 14h18M3 18h18';
    }
    if (amenityLower.includes('pool') || amenityLower.includes('swimming')) {
      return 'M13 10V3L4 14h7v7l9-11h-7z';
    }
    if (amenityLower.includes('parking') || amenityLower.includes('garage')) {
      return 'M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z';
    }
    if (amenityLower.includes('tv') || amenityLower.includes('television')) {
      return 'M21 12a9 9 0 11-18 0 9 9 0 0118 0z';
    }
    if (amenityLower.includes('air conditioning') || amenityLower.includes('ac')) {
      return 'M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z';
    }
    if (amenityLower.includes('washer') || amenityLower.includes('laundry')) {
      return 'M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15';
    }
    if (amenityLower.includes('gym') || amenityLower.includes('fitness')) {
      return 'M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4l-2-1-2 1M4 7l2-1M4 7l2 1M4 7v2.5M12 21l-2-1m2 1l2-1m-2 1v-2.5M6 18l-2-1v-2.5M18 18l2-1v-2.5';
    }

    // Default icon (checkmark)
    return 'M5 13l4 4L19 7';
  }

  navigateToListing(publicId: string): void {
    this.router.navigate(['/listings', publicId]);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  formatRating(rating: number): string {
    return rating.toFixed(1);
  }

  getRatingStars(rating: number): number[] {
    return Array(5).fill(0).map((_, i) => i < Math.round(rating) ? 1 : 0);
  }

  /**
   * Get full image URL from backend path
   */
  getImageUrl(imagePath: string): string {
    return ImageUrlHelper.getFullImageUrl(imagePath);
  }
}
