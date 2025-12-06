import { Component, OnInit, Inject } from '@angular/core';
import { CommonModule, DOCUMENT } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ListingService } from '../services/listing.service';
import { Listing } from '../models/listing.model';

@Component({
  selector: 'app-listing-detail',
  standalone: true,
  imports: [FormsModule],
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

  constructor(
    private listingService: ListingService,
    private route: ActivatedRoute,
    private router: Router,
    @Inject(DOCUMENT) private document: Document
  ) {
    this.today = new Date().toISOString().split('T')[0];
    this.currentUrl = this.document.location.href;
  }

  ngOnInit(): void {
    const publicId = this.route.snapshot.paramMap.get('publicId');
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
        }
        this.loading = false;
      },
      error: (error) => {
        this.error = 'Failed to load listing. Please try again.';
        this.loading = false;
        console.error('Error loading listing:', error);
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
    
    this.router.navigate(['/bookings/create'], {
      queryParams: {
        listingId: this.listing?.publicId,
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
}