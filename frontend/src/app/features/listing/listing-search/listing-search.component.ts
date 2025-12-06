import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ListingService } from '../services/listing.service';
import { ListingCardComponent } from '../listing-card/listing-card.component';
import { 
  Listing, 
  SearchListingParams, 
  CATEGORIES, 
  PROPERTY_TYPES, 
  AMENITIES 
} from '../models/listing.model';

@Component({
  selector: 'app-listing-search',
  standalone: true,
  imports: [CommonModule, FormsModule, ListingCardComponent],
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
    instantBook: false
  };

  constructor(
    private listingService: ListingService,
    private route: ActivatedRoute,
    private router: Router
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
      },
      error: (error) => {
        this.error = 'Failed to load listings. Please try again.';
        this.loading = false;
        console.error('Error loading listings:', error);
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
    this.loadListings();
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
      instantBook: this.searchParams.instantBook || false
    };
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
      instantBook: false
    };
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
      this.searchParams.instantBook
    );
  }

  getActiveFiltersCount(): number {
    let count = 0;
    if (this.searchParams.minPrice || this.searchParams.maxPrice) count++;
    if (this.searchParams.propertyTypes && this.searchParams.propertyTypes.length > 0) count++;
    if (this.searchParams.amenities && this.searchParams.amenities.length > 0) count++;
    if (this.searchParams.minBedrooms) count++;
    if (this.searchParams.minBeds) count++;
    if (this.searchParams.minBathrooms) count++;
    if (this.searchParams.instantBook) count++;
    return count;
  }
}