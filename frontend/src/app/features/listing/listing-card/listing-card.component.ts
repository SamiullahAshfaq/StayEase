import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Listing } from '../models/listing.model';
import { ImageUrlHelper } from '../../../shared/utils/image-url.helper';

@Component({
  selector: 'app-listing-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './listing-card.component.html'
})
export class ListingCardComponent {
  @Input() listing!: Listing;

  currentImageIndex = 0;
  isHovered = false;

  constructor(private router: Router) {}

  navigateToListing(): void {
    console.log('Navigating to listing:', this.listing.publicId);
    this.router.navigate(['/listings', this.listing.publicId]);
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
