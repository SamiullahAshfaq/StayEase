import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FavoriteService } from '../../core/services/favorite.service';
import { Listing } from '../listing/models/listing.model';

@Component({
  selector: 'app-favorites',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './favorites.component.html',
  styleUrls: ['./favorites.component.css']
})
export class FavoritesComponent implements OnInit {
  private favoriteService = inject(FavoriteService);
  
  favorites = signal<Listing[]>([]);
  isLoading = signal(true);
  error = signal<string | null>(null);

  ngOnInit() {
    this.loadFavorites();
  }

  loadFavorites() {
    this.isLoading.set(true);
    this.error.set(null);
    
    this.favoriteService.getUserFavorites().subscribe({
      next: (listings: Listing[]) => {
        this.favorites.set(listings);
        this.isLoading.set(false);
      },
      error: (err: any) => {
        this.error.set('Failed to load favorites');
        this.isLoading.set(false);
        console.error('Error loading favorites:', err);
      }
    });
  }

  removeFavorite(listingId: string) {
    this.favoriteService.removeFromFavorites(listingId).subscribe({
      next: () => {
        // Remove from local list
        const updated = this.favorites().filter(l => l.publicId !== listingId);
        this.favorites.set(updated);
      },
      error: (err: any) => {
        console.error('Error removing favorite:', err);
      }
    });
  }

  getCoverImage(listing: Listing): string {
    if (listing.coverImageUrl) {
      return listing.coverImageUrl;
    }
    if (listing.images && listing.images.length > 0) {
      return listing.images[0].url;
    }
    return '/images/placeholder-listing.jpg';
  }
}
