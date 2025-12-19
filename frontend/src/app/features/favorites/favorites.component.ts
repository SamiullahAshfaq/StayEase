import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FavoriteService } from '../../core/services/favorite.service';
import { Listing } from '../listing/models/listing.model';
import { ImageUrlHelper } from '../../shared/utils/image-url.helper';

@Component({
  selector: 'app-favorites',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './favorites.component.html',
  styleUrls: ['./favorites.component.css']
})
export class FavoritesComponent implements OnInit {
  private favoriteService: FavoriteService = inject(FavoriteService);
  
  favorites = signal<Listing[]>([]);
  isLoading = signal(true);
  error = signal<string | null>(null);

  ngOnInit(): void {
    this.loadFavorites();
  }

  loadFavorites(): void {
    this.isLoading.set(true);
    this.error.set(null);
    
    this.favoriteService.getUserFavorites().subscribe({
      next: (listings: Listing[]) => {
        this.favorites.set(listings);
        this.isLoading.set(false);
      },
      error: (err: Error) => {
        this.error.set('Failed to load favorites');
        this.isLoading.set(false);
        console.error('Error loading favorites:', err);
      }
    });
  }

  removeFavorite(listingId: string): void {
    this.favoriteService.removeFromFavorites(listingId).subscribe({
      next: () => {
        // Remove from local list
        const updated = this.favorites().filter(l => l.publicId !== listingId);
        this.favorites.set(updated);
      },
      error: (err: Error) => {
        console.error('Error removing favorite:', err);
      }
    });
  }

  getCoverImage(listing: Listing): string {
    if (listing.coverImageUrl) {
      return ImageUrlHelper.getFullImageUrl(listing.coverImageUrl);
    }
    if (listing.images && listing.images.length > 0) {
      return ImageUrlHelper.getFullImageUrl(listing.images[0].url);
    }
    return ImageUrlHelper.getPlaceholderImage();
  }
}
