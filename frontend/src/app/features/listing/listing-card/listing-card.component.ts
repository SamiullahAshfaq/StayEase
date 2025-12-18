import { Component, Input, ChangeDetectionStrategy, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Listing } from '../models/listing.model';
import { ImageUrlHelper } from '../../../shared/utils/image-url.helper';
import { FavoriteService } from '../../../core/services/favorite.service';
import { AuthService } from '../../../core/auth/auth.service';

@Component({
  selector: 'app-listing-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './listing-card.component.html',
  changeDetection: ChangeDetectionStrategy.Default
})
export class ListingCardComponent implements OnInit {
  @Input() listing!: Listing;

  private favoriteService = inject(FavoriteService);
  private authService = inject(AuthService);
  private router = inject(Router);

  currentImageIndex = 0;
  isHovered = false;
  isFavorite = signal(false);
  isTogglingFavorite = false;

  ngOnInit(): void {
    // Ensure images are available on init
    if (this.listing) {
      console.log('Listing card initialized:', this.listing.publicId, 'Images:', this.listing.images?.length);
      
      // Check if user is logged in and load favorite status
      if (this.authService.isAuthenticated()) {
        this.checkFavoriteStatus();
      }
    }
  }

  checkFavoriteStatus(): void {
    this.favoriteService.isFavorite(this.listing.publicId).subscribe({
      next: (isFav) => {
        this.isFavorite.set(isFav);
      },
      error: (err) => {
        console.error('Error checking favorite status:', err);
      }
    });
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
    
    // Check if user is logged in
    if (!this.authService.isAuthenticated()) {
      // Redirect to login page
      this.router.navigate(['/auth/login'], {
        queryParams: { returnUrl: this.router.url }
      });
      return;
    }

    // Prevent multiple clicks while toggling
    if (this.isTogglingFavorite) {
      return;
    }

    this.isTogglingFavorite = true;
    const currentStatus = this.isFavorite();

    // Optimistic UI update
    this.isFavorite.set(!currentStatus);

    // Call API
    this.favoriteService.toggleFavorite(this.listing.publicId, currentStatus).subscribe({
      next: () => {
        this.isTogglingFavorite = false;
        console.log('Favorite toggled successfully');
      },
      error: (err) => {
        // Revert on error
        this.isFavorite.set(currentStatus);
        this.isTogglingFavorite = false;
        console.error('Error toggling favorite:', err);
      }
    });
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
