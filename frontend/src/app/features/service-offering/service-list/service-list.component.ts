import { Component, OnInit, inject, signal, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ServiceOfferingService } from '../services/service-offering.service';
import { 
  ServiceOffering, 
  ServiceFilter, 
  ServiceCategory,
  SERVICE_CATEGORY_LABELS 
} from '../models/service-offering.model';

@Component({
  selector: 'app-service-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './service-list.component.html',
  styleUrl: './service-list.component.css'
})
export class ServiceListComponent implements OnInit {
  private serviceOfferingService = inject(ServiceOfferingService);

  // Optional inputs for filtering
  category = input<ServiceCategory>();
  city = input<string>();

  // State
  services = signal<ServiceOffering[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);
  
  // Pagination
  currentPage = signal(0);
  totalPages = signal(0);
  totalElements = signal(0);
  pageSize = signal(12);

  // Filters
  selectedCategory = signal<ServiceCategory | null>(null);
  selectedCity = signal<string>('');
  searchKeyword = signal<string>('');
  minPrice = signal<number | null>(null);
  maxPrice = signal<number | null>(null);
  minRating = signal<number | null>(null);
  mobileServiceOnly = signal(false);
  instantBookingOnly = signal(false);
  sortBy = signal<'createdAt' | 'averageRating' | 'basePrice' | 'totalBookings'>('averageRating');
  sortDirection = signal<'asc' | 'desc'>('desc');

  // View mode
  viewMode = signal<'grid' | 'list'>('grid');

  // Categories
  categories = Object.values(ServiceCategory);
  categoryLabels = SERVICE_CATEGORY_LABELS;

  // Favorites
  favoriteIds = signal<Set<string>>(new Set());

  // Expose Math for template
  Math = Math;

  ngOnInit() {
    // Set initial filters from inputs
    if (this.category()) {
      this.selectedCategory.set(this.category()!);
    }
    if (this.city()) {
      this.selectedCity.set(this.city()!);
    }
    
    this.loadServices();
  }

  loadServices() {
    this.loading.set(true);
    this.error.set(null);

    const filter: ServiceFilter = {
      category: this.selectedCategory() || undefined,
      city: this.selectedCity() || undefined,
      keyword: this.searchKeyword() || undefined,
      minPrice: this.minPrice() || undefined,
      maxPrice: this.maxPrice() || undefined,
      minRating: this.minRating() || undefined,
      providesMobileService: this.mobileServiceOnly() || undefined,
      isInstantBooking: this.instantBookingOnly() || undefined,
      sortBy: this.sortBy(),
      sortDirection: this.sortDirection(),
      page: this.currentPage(),
      size: this.pageSize()
    };

    this.serviceOfferingService.getServices(filter).subscribe({
      next: (response) => {
        const data = response.data;
        this.services.set(data.content);
        this.totalPages.set(data.totalPages);
        this.totalElements.set(data.totalElements);
        this.currentPage.set(data.currentPage);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error loading services:', err);
        this.error.set('Failed to load services. Please try again.');
        this.loading.set(false);
      }
    });
  }

  /**
   * Filter methods
   */
  filterByCategory(category: ServiceCategory | null) {
    this.selectedCategory.set(category);
    this.currentPage.set(0);
    this.loadServices();
  }

  search(keyword: string) {
    this.searchKeyword.set(keyword);
    this.currentPage.set(0);
    this.loadServices();
  }

  toggleMobileService() {
    this.mobileServiceOnly.set(!this.mobileServiceOnly());
    this.currentPage.set(0);
    this.loadServices();
  }

  toggleInstantBooking() {
    this.instantBookingOnly.set(!this.instantBookingOnly());
    this.currentPage.set(0);
    this.loadServices();
  }

  changeSortBy(sortBy: 'createdAt' | 'averageRating' | 'basePrice' | 'totalBookings') {
    this.sortBy.set(sortBy);
    this.currentPage.set(0);
    this.loadServices();
  }

  applyPriceFilter() {
    this.currentPage.set(0);
    this.loadServices();
  }

  clearFilters() {
    this.selectedCategory.set(null);
    this.selectedCity.set('');
    this.searchKeyword.set('');
    this.minPrice.set(null);
    this.maxPrice.set(null);
    this.minRating.set(null);
    this.mobileServiceOnly.set(false);
    this.instantBookingOnly.set(false);
    this.currentPage.set(0);
    this.loadServices();
  }

  /**
   * Pagination
   */
  nextPage() {
    if (this.currentPage() < this.totalPages() - 1) {
      this.currentPage.update(page => page + 1);
      this.loadServices();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  previousPage() {
    if (this.currentPage() > 0) {
      this.currentPage.update(page => page - 1);
      this.loadServices();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  goToPage(page: number) {
    this.currentPage.set(page);
    this.loadServices();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  /**
   * Favorites
   */
  toggleFavorite(service: ServiceOffering, event: Event) {
    event.preventDefault();
    event.stopPropagation();

    const isFavorite = this.favoriteIds().has(service.publicId);
    
    this.serviceOfferingService.toggleFavorite(service.publicId, !isFavorite).subscribe({
      next: () => {
        this.favoriteIds.update(favs => {
          const newFavs = new Set(favs);
          if (isFavorite) {
            newFavs.delete(service.publicId);
          } else {
            newFavs.add(service.publicId);
          }
          return newFavs;
        });
      },
      error: (err) => {
        console.error('Error toggling favorite:', err);
      }
    });
  }

  isFavorite(publicId: string): boolean {
    return this.favoriteIds().has(publicId);
  }

  /**
   * Helper methods
   */
  getStarArray(rating: number): number[] {
    return Array(5).fill(0).map((_, i) => i + 1);
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(price);
  }
}
