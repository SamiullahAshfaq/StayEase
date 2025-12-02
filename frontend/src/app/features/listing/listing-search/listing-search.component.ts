import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { PaginatorModule } from 'primeng/paginator';
import { SkeletonModule } from 'primeng/skeleton';
import { ListingService } from '../services/listing.service';
import { ListingCardComponent } from '../listing-card/listing-card.component';
import { Listing, Page, SearchListing } from '../models/listing.model';

@Component({
  selector: 'app-listing-search',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    InputTextModule,
    ButtonModule,
    AutoCompleteModule,
    PaginatorModule,
    SkeletonModule,
    ListingCardComponent
  ],
  templateUrl: './listing-search.component.html'
})
export class ListingSearchComponent implements OnInit {
  private listingService = inject(ListingService);

  listingsPage: Page<Listing> = {
    content: [],
    totalElements: 0,
    totalPages: 0,
    size: 20,
    number: 0
  };

  searchCriteria: SearchListing = {
    page: 0,
    size: 20,
    sortBy: 'createdAt',
    sortDirection: 'DESC'
  };

  categories: string[] = [];
  filteredCategories: string[] = [];
  loading = false;

  ngOnInit() {
    this.loadCategories();
    this.search();
  }

  loadCategories() {
    this.listingService.getAllCategories().subscribe(cats => {
      this.categories = cats;
    });
  }

  filterCategories(event: any) {
    const query = event.query.toLowerCase();
    this.filteredCategories = this.categories.filter(cat =>
      cat.toLowerCase().includes(query)
    );
  }

  search() {
    this.loading = true;
    this.listingService.searchListings(this.searchCriteria).subscribe({
      next: (page) => {
        this.listingsPage = page;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  onPageChange(event: any) {
    this.searchCriteria.page = event.page;
    this.search();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}
