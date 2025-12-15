import { Component, Input, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Listing } from '../models/listing.model';
import { ImageUrlHelper } from '../../../shared/utils/image-url.helper';

@Component({
  selector: 'app-listing-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './listing-card.component.html',
  changeDetection: ChangeDetectionStrategy.Default
})
export class ListingCardComponent implements OnInit {
  @Input() listing!: Listing;

  currentImageIndex = 0;
  isHovered = false;

  constructor(private router: Router) {}

  ngOnInit(): void {
    // Ensure images are available on init
    if (this.listing) {
      console.log('Listing card initialized:', this.listing.publicId, 'Images:', this.listing.images?.length);
    }
  }

  navigateToListing(): void {
    console.log('Navigating to listing detail:', this.listing.publicId);
    // Navigate to listing detail page where user can view full details and book
    this.router.navigate(['/listing', this.listing.publicId]);
  }

  nextImage(event: Event): void {
    event.stopPropagation();
    if (this.listing.images && this.currentImageIndex < this.listing.images.length - 1) {
      this.currentImageIndex++;
    }
  }

  previousImage(event: Event): void {
    event.stopPropagation();
    if (this.currentImageIndex > 0) {
      this.currentImageIndex--;
    }
  }

  setImage(index: number, event: Event): void {
    event.stopPropagation();
    this.currentImageIndex = index;
  }

  toggleFavorite(event: Event): void {
    event.stopPropagation();
    // TODO: Implement favorite functionality
  }

  getDisplayImage(): string {
    if (this.listing.images && this.listing.images.length > 0) {
      const imageUrl = this.listing.images[this.currentImageIndex]?.url || this.listing.coverImageUrl || '';
      return ImageUrlHelper.getFullImageUrl(imageUrl);
    }
    return this.listing.coverImageUrl
      ? ImageUrlHelper.getFullImageUrl(this.listing.coverImageUrl)
      : ImageUrlHelper.getPlaceholderImage();
  }
}
