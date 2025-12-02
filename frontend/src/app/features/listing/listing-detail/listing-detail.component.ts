import { Component, OnInit, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { GalleriaModule } from 'primeng/galleria';
import { DatePicker } from 'primeng/datepicker';
import { SkeletonModule } from 'primeng/skeleton';
import { ListingService } from '../services/listing.service';

export interface Listing {
  id: string;
  title: string;
  images: string[];
  city: string;
  state: string;
  country: string;
  guests: number;
  bedrooms: number;
  beds: number;
  bathrooms: number;
  amenities: string[];
  price: number;
  description: string;
}

@Component({
  selector: 'app-listing-detail',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    GalleriaModule,
    DatePicker,
    SkeletonModule
  ],
  templateUrl: './listing-detail.component.html'
})
export class ListingDetailComponent implements OnInit {
  @Input() id!: string;

  private listingService = inject(ListingService);
  private router = inject(Router);

  listing: Listing | null = null;
  loading = true;
  showGalleria = false;
  checkInDate: Date | null = null;
  checkOutDate: Date | null = null;
  today = new Date();

  ngOnInit() {
    if (this.id) {
      this.loadListing();
    } else {
      this.router.navigate(['/listings']);
    }
  }

  loadListing() {
    this.listingService.getListingById(this.id).subscribe({
      next: (listing) => {
        // Map images to string URLs if necessary
        this.listing = {
          ...listing,
          images: Array.isArray(listing.images)
            ? listing.images.map((img: any) => typeof img === 'string' ? img : img.url)
            : []
        };
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.router.navigate(['/listings']);
      }
    });
  }

  reserve() {
    if (this.checkInDate && this.checkOutDate && this.listing) {
      console.log('Reserving:', {
        listingId: this.listing.id,
        checkIn: this.checkInDate,
        checkOut: this.checkOutDate
      });
    }
  }

  share() {
    if (navigator.share && this.listing) {
      navigator.share({
        title: this.listing.title,
        text: this.listing.description,
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
    }
  }
}
