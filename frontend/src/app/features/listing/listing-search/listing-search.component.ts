import { Component, OnInit, ChangeDetectorRef } from '@angular/core';

import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ListingService } from '../services/listing.service';
import { ListingCardComponent } from '../listing-card/listing-card.component';
import { 
  Listing, 
  SearchListingParams, 
  CATEGORIES, 
  CATEGORY_ICONS,
  PROPERTY_TYPES, 
  AMENITIES 
} from '../models/listing.model';

@Component({
  selector: 'app-listing-search',
  standalone: true,
  imports: [FormsModule, ListingCardComponent],
  templateUrl: './listing-search.component.html'
})
export class ListingSearchComponent implements OnInit {
  listings: Listing[] = [];
  loading = false;
  error: string | null = null;
  
  // Pagination
  currentPage = 0;
  pageSize = 20;
  totalPages = 0;
  totalElements = 0;
  
  // Search params
  searchParams: SearchListingParams = {
    page: 0,
    size: 20,
    sortBy: 'createdAt',
    sortDirection: 'DESC'
  };
  
  // Filter states
  showFiltersModal = false;
  selectedCategory: string | null = null;
  categories = CATEGORIES;
  categoryIcons = CATEGORY_ICONS;
  propertyTypes = PROPERTY_TYPES;
  amenities = AMENITIES;
  
  // Temp filter values (for modal)
  tempFilters = {
    minPrice: undefined as number | undefined,
    maxPrice: undefined as number | undefined,
    propertyTypes: [] as string[],
    amenities: [] as string[],
    minBedrooms: undefined as number | undefined,
    minBeds: undefined as number | undefined,
    minBathrooms: undefined as number | undefined,
    minGuests: undefined as number | undefined,
    instantBook: false
  };

  // Price presets
  pricePresets = [
    { label: 'Any price', min: undefined, max: undefined },
    { label: 'Under $100', min: undefined, max: 100 },
    { label: '$100 - $200', min: 100, max: 200 },
    { label: '$200 - $400', min: 200, max: 400 },
    { label: '$400+', min: 400, max: undefined }
  ];

  selectedPricePreset: string | null = null;

  constructor(
    private listingService: ListingService,
    private route: ActivatedRoute,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      // Load from query params
      if (params['location']) this.searchParams.location = params['location'];
      if (params['checkIn']) this.searchParams.checkIn = params['checkIn'];
      if (params['checkOut']) this.searchParams.checkOut = params['checkOut'];
      if (params['guests']) this.searchParams.guests = +params['guests'];
      if (params['category']) {
        this.selectedCategory = params['category'];
        this.searchParams.categories = [params['category']];
      }
      
      this.loadListings();
    });
  }

  loadListings(): void {
    this.loading = true;
    this.error = null;
    
    this.listingService.searchListings(this.searchParams).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.listings = response.data.content;
          this.currentPage = response.data.number;
          this.pageSize = response.data.size;
          this.totalPages = response.data.totalPages;
          this.totalElements = response.data.totalElements;
        }
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        this.error = 'Failed to load listings. Please try again.';
        this.loading = false;
        console.error('Error loading listings:', error);
        this.cdr.detectChanges();
      }
    });
  }

  selectCategory(category: string): void {
    if (this.selectedCategory === category) {
      this.selectedCategory = null;
      this.searchParams.categories = undefined;
    } else {
      this.selectedCategory = category;
      this.searchParams.categories = [category];
    }
    this.searchParams.page = 0;
    // Only update query params - the subscription will trigger loadListings
    this.updateQueryParams();
  }

  openFiltersModal(): void {
    // Copy current filters to temp
    this.tempFilters = {
      minPrice: this.searchParams.minPrice,
      maxPrice: this.searchParams.maxPrice,
      propertyTypes: this.searchParams.propertyTypes || [],
      amenities: this.searchParams.amenities || [],
      minBedrooms: this.searchParams.minBedrooms,
      minBeds: this.searchParams.minBeds,
      minBathrooms: this.searchParams.minBathrooms,
      minGuests: this.searchParams.guests,
      instantBook: this.searchParams.instantBook || false
    };
    
    // Determine selected price preset
    this.updateSelectedPricePreset();
    
    this.showFiltersModal = true;
    document.body.style.overflow = 'hidden';
  }

  closeFiltersModal(): void {
    this.showFiltersModal = false;
    document.body.style.overflow = 'auto';
  }

  applyFilters(): void {
    this.searchParams = {
      ...this.searchParams,
      ...this.tempFilters,
      guests: this.tempFilters.minGuests,
      page: 0
    };
    this.loadListings();
    this.closeFiltersModal();
    this.updateQueryParams();
  }

  clearFilters(): void {
    this.tempFilters = {
      minPrice: undefined,
      maxPrice: undefined,
      propertyTypes: [],
      amenities: [],
      minBedrooms: undefined,
      minBeds: undefined,
      minBathrooms: undefined,
      minGuests: undefined,
      instantBook: false
    };
    this.selectedPricePreset = null;
  }

  clearAllFilters(): void {
    this.searchParams = {
      page: 0,
      size: 20,
      sortBy: 'createdAt',
      sortDirection: 'DESC'
    };
    this.selectedCategory = null;
    this.loadListings();
    this.router.navigate([], { queryParams: {} });
  }

  togglePropertyType(type: string): void {
    const index = this.tempFilters.propertyTypes.indexOf(type);
    if (index > -1) {
      this.tempFilters.propertyTypes.splice(index, 1);
    } else {
      this.tempFilters.propertyTypes.push(type);
    }
  }

  toggleAmenity(amenity: string): void {
    const index = this.tempFilters.amenities.indexOf(amenity);
    if (index > -1) {
      this.tempFilters.amenities.splice(index, 1);
    } else {
      this.tempFilters.amenities.push(amenity);
    }
  }

  setPricePreset(preset: { label: string, min: number | undefined, max: number | undefined }): void {
    this.tempFilters.minPrice = preset.min;
    this.tempFilters.maxPrice = preset.max;
    this.selectedPricePreset = preset.label;
  }

  updateSelectedPricePreset(): void {
    const matchingPreset = this.pricePresets.find(p => 
      p.min === this.tempFilters.minPrice && p.max === this.tempFilters.maxPrice
    );
    this.selectedPricePreset = matchingPreset ? matchingPreset.label : null;
  }

  onPriceInputChange(): void {
    // Clear preset selection when manually changing prices
    this.selectedPricePreset = null;
  }

  incrementCounter(field: 'minBedrooms' | 'minBeds' | 'minBathrooms' | 'minGuests'): void {
    const current = this.tempFilters[field] || 0;
    this.tempFilters[field] = current + 1;
  }

  decrementCounter(field: 'minBedrooms' | 'minBeds' | 'minBathrooms' | 'minGuests'): void {
    const current = this.tempFilters[field] || 0;
    if (current > 0) {
      this.tempFilters[field] = current - 1;
      if (this.tempFilters[field] === 0) {
        this.tempFilters[field] = undefined;
      }
    }
  }

  resetCounter(field: 'minBedrooms' | 'minBeds' | 'minBathrooms' | 'minGuests'): void {
    this.tempFilters[field] = undefined;
  }

  isPropertyTypeSelected(type: string): boolean {
    return this.tempFilters.propertyTypes.includes(type);
  }

  isAmenitySelected(amenity: string): boolean {
    return this.tempFilters.amenities.includes(amenity);
  }

  changePage(page: number): void {
    this.searchParams.page = page;
    this.loadListings();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  updateQueryParams(): void {
    const params: any = {};
    if (this.searchParams.location) params.location = this.searchParams.location;
    if (this.searchParams.checkIn) params.checkIn = this.searchParams.checkIn;
    if (this.searchParams.checkOut) params.checkOut = this.searchParams.checkOut;
    if (this.searchParams.guests) params.guests = this.searchParams.guests;
    if (this.selectedCategory) params.category = this.selectedCategory;
    
    this.router.navigate([], { queryParams: params, queryParamsHandling: 'merge' });
  }

  hasActiveFilters(): boolean {
    return !!(
      this.searchParams.minPrice ||
      this.searchParams.maxPrice ||
      (this.searchParams.propertyTypes && this.searchParams.propertyTypes.length > 0) ||
      (this.searchParams.amenities && this.searchParams.amenities.length > 0) ||
      this.searchParams.minBedrooms ||
      this.searchParams.minBeds ||
      this.searchParams.minBathrooms ||
      this.searchParams.guests ||
      this.searchParams.instantBook
    );
  }

  getActiveFiltersCount(): number {
    let count = 0;
    if (this.searchParams.minPrice || this.searchParams.maxPrice) count++;
    if (this.searchParams.propertyTypes && this.searchParams.propertyTypes.length > 0) count += this.searchParams.propertyTypes.length;
    if (this.searchParams.amenities && this.searchParams.amenities.length > 0) count += this.searchParams.amenities.length;
    if (this.searchParams.minBedrooms) count++;
    if (this.searchParams.minBeds) count++;
    if (this.searchParams.minBathrooms) count++;
    if (this.searchParams.guests) count++;
    if (this.searchParams.instantBook) count++;
    return count;
  }

  getFilterSummary(): string[] {
    const summary: string[] = [];
    
    if (this.searchParams.minPrice || this.searchParams.maxPrice) {
      const min = this.searchParams.minPrice || 0;
      const max = this.searchParams.maxPrice || '∞';
      summary.push(`$${min} - $${max}`);
    }
    
    if (this.searchParams.propertyTypes && this.searchParams.propertyTypes.length > 0) {
      summary.push(...this.searchParams.propertyTypes);
    }
    
    if (this.searchParams.minBedrooms) {
      summary.push(`${this.searchParams.minBedrooms}+ bedrooms`);
    }
    
    if (this.searchParams.minBeds) {
      summary.push(`${this.searchParams.minBeds}+ beds`);
    }
    
    if (this.searchParams.minBathrooms) {
      summary.push(`${this.searchParams.minBathrooms}+ bathrooms`);
    }
    
    if (this.searchParams.guests) {
      summary.push(`${this.searchParams.guests}+ guests`);
    }
    
    if (this.searchParams.amenities && this.searchParams.amenities.length > 0) {
      if (this.searchParams.amenities.length <= 2) {
        summary.push(...this.searchParams.amenities);
      } else {
        summary.push(`${this.searchParams.amenities.length} amenities`);
      }
    }
    
    if (this.searchParams.instantBook) {
      summary.push('Instant Book');
    }
    
    return summary;
  }
}