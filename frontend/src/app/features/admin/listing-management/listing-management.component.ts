import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AdminService } from '../services/admin.service';
import { ListingManagement } from '../services/admin.models';

@Component({
  selector: 'app-listing-management',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './listing-management.component.html',
  styleUrl: './listing-management.component.css'
})
export class ListingManagementComponent implements OnInit {
  private adminService = inject(AdminService);

  listings = signal<ListingManagement[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);

  // Filters
  status = signal<string>('');
  searchTerm = signal<string>('');

  // Pagination
  currentPage = signal(0);
  pageSize = signal(10);
  totalPages = signal(0);

  ngOnInit() {
    this.loadListings();
  }

  loadListings() {
    this.loading.set(true);
    this.error.set(null);

    this.adminService.getListings(
      this.currentPage(),
      this.pageSize(),
      this.status() || undefined,
      this.searchTerm() || undefined
    ).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.listings.set(response.data.content);
          this.totalPages.set(response.data.totalPages);
        }
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Failed to load listings');
        this.loading.set(false);
      }
    });
  }

  approveListing(listingId: number, publicId: string) {
    if (!confirm('Are you sure you want to approve this listing?')) return;

    const reason = prompt('Provide a reason for approval (optional):') || 'Approved by admin';

    this.adminService.approveListing(publicId, reason).subscribe({
      next: () => {
        this.loadListings();
      },
      error: () => {
        alert('Failed to approve listing');
      }
    });
  }

  rejectListing(listingId: number, publicId: string) {
    const reason = prompt('Please provide a reason for rejection:');
    if (!reason) return;

    this.adminService.rejectListing(publicId, reason).subscribe({
      next: () => {
        this.loadListings();
      },
      error: () => {
        alert('Failed to reject listing');
      }
    });
  }

  featureListing(listingId: number, publicId: string, featured: boolean) {
    const reason = featured
      ? prompt('Provide a reason for featuring this listing:') || 'Featured by admin'
      : prompt('Provide a reason for unfeaturing this listing:') || 'Unfeatured by admin';

    const action$ = featured
      ? this.adminService.featureListing(publicId, reason)
      : this.adminService.unfeatureListing(publicId, reason);

    action$.subscribe({
      next: () => {
        this.loadListings();
      },
      error: () => {
        alert('Failed to update listing');
      }
    });
  }

  onStatusChange() {
    this.currentPage.set(0);
    this.loadListings();
  }

  onSearch() {
    this.currentPage.set(0);
    this.loadListings();
  }

  nextPage() {
    if (this.currentPage() < this.totalPages() - 1) {
      this.currentPage.update(p => p + 1);
      this.loadListings();
    }
  }

  previousPage() {
    if (this.currentPage() > 0) {
      this.currentPage.update(p => p - 1);
      this.loadListings();
    }
  }
}
