import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AdminService } from '../services/admin.service';
import { BookingManagement } from '../services/admin.models';

@Component({
  selector: 'app-booking-management',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="booking-management">
      <!-- Header -->
      <div class="page-header">
        <div>
          <h1 class="page-title">Booking Management</h1>
          <p class="page-subtitle">Manage all platform bookings</p>
        </div>
      </div>

      <!-- Filters -->
      <div class="filters-card">
        <div class="filters-grid">
          <div class="filter-group">
            <label for="statusFilter" class="filter-label">Status</label>
            <select id="statusFilter" [(ngModel)]="statusFilter" (change)="onFilterChange()" class="filter-select">
              <option value="">All Statuses</option>
              <option value="PENDING">Pending</option>
              <option value="CONFIRMED">Confirmed</option>
              <option value="COMPLETED">Completed</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>
          <div class="filter-group">
            <label for="searchInput" class="filter-label">Search</label>
            <input
              id="searchInput"
              type="text"
              [(ngModel)]="searchTerm"
              (keyup.enter)="onSearch()"
              placeholder="Search by guest or listing..."
              class="filter-input"
            />
          </div>
          <div class="filter-actions">
            <button (click)="onSearch()" class="btn-search">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
              </svg>
              Search
            </button>
            <button (click)="resetFilters()" class="btn-reset">Reset</button>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div *ngIf="loading()" class="loading-container">
        <div class="spinner"></div>
        <p>Loading bookings...</p>
      </div>

      <!-- Error State -->
      <div *ngIf="error()" class="error-container">
        <div class="error-icon">⚠️</div>
        <p>{{ error() }}</p>
        <button (click)="loadBookings()" class="retry-btn">Try Again</button>
      </div>

      <!-- Bookings Table -->
      <div *ngIf="!loading() && !error()" class="table-card">
        <div class="table-header">
          <h3>Bookings ({{ totalElements() }})</h3>
        </div>

        <div *ngIf="bookings().length === 0" class="empty-state">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
          </svg>
          <p>No bookings found</p>
        </div>

        <div *ngIf="bookings().length > 0" class="table-wrapper">
          <table class="data-table">
            <thead>
              <tr>
                <th>Booking ID</th>
                <th>Listing</th>
                <th>Guest</th>
                <th>Landlord</th>
                <th>Check-in</th>
                <th>Check-out</th>
                <th>Total</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let booking of bookings()">
                <td>
                  <span class="booking-id">{{ booking.publicId.substring(0, 8) }}...</span>
                </td>
                <td>
                  <div class="listing-info">
                    <div class="listing-title">{{ booking.listingTitle }}</div>
                  </div>
                </td>
                <td>
                  <div class="user-info">
                    <div class="user-name">{{ booking.guestName }}</div>
                    <div class="user-email">{{ booking.guestEmail }}</div>
                  </div>
                </td>
                <td>
                  <div class="user-info">
                    <div class="user-name">{{ booking.landlordName }}</div>
                    <div class="user-email">{{ booking.landlordEmail }}</div>
                  </div>
                </td>
                <td>{{ formatDate(booking.checkInDate) }}</td>
                <td>{{ formatDate(booking.checkOutDate) }}</td>
                <td>
                  <span class="price">\${{ booking.totalPrice.toFixed(2) }}</span>
                </td>
                <td>
                  <span [class]="'status-badge status-' + booking.status.toLowerCase()">
                    {{ booking.status }}
                  </span>
                </td>
                <td>
                  <div class="action-buttons">
                    <button
                      *ngIf="booking.status === 'CONFIRMED' || booking.status === 'PENDING'"
                      (click)="cancelBooking(booking.id, booking.publicId)"
                      class="btn-action btn-cancel"
                      title="Cancel Booking">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </button>
                    <button
                      [routerLink]="['/booking', booking.publicId]"
                      class="btn-action btn-view"
                      title="View Details">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                        <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <div *ngIf="totalPages() > 1" class="pagination">
          <button
            (click)="previousPage()"
            [disabled]="currentPage() === 0"
            class="pagination-btn">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
            Previous
          </button>
          <span class="pagination-info">
            Page {{ currentPage() + 1 }} of {{ totalPages() }}
          </span>
          <button
            (click)="nextPage()"
            [disabled]="currentPage() >= totalPages() - 1"
            class="pagination-btn">
            Next
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .booking-management {
      padding: 2rem;
      background-color: #f7f7f7;
      min-height: 100vh;
    }

    /* Header */
    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
    }

    .page-title {
      font-size: 1.875rem;
      font-weight: 700;
      color: #222;
      margin: 0;
    }

    .page-subtitle {
      font-size: 0.875rem;
      color: #717171;
      margin: 0.5rem 0 0 0;
    }

    /* Filters */
    .filters-card {
      background: white;
      border-radius: 12px;
      padding: 1.5rem;
      margin-bottom: 1.5rem;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }

    .filters-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;
      align-items: end;
    }

    .filter-group {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .filter-label {
      font-size: 0.875rem;
      font-weight: 600;
      color: #222;
    }

    .filter-select, .filter-input {
      padding: 0.625rem 0.875rem;
      border: 1px solid #d4d4d4;
      border-radius: 8px;
      font-size: 0.875rem;
      transition: all 0.2s;
    }

    .filter-select:focus, .filter-input:focus {
      outline: none;
      border-color: #222;
      box-shadow: 0 0 0 1px #222;
    }

    .filter-actions {
      display: flex;
      gap: 0.5rem;
    }

    .btn-search, .btn-reset {
      padding: 0.625rem 1.25rem;
      border: none;
      border-radius: 8px;
      font-size: 0.875rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .btn-search {
      background: #FF385C;
      color: white;
    }

    .btn-search:hover {
      background: #E31C5F;
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(255, 56, 92, 0.3);
    }

    .btn-search svg {
      width: 1rem;
      height: 1rem;
    }

    .btn-reset {
      background: #f7f7f7;
      color: #222;
    }

    .btn-reset:hover {
      background: #ebebeb;
    }

    /* Loading & Error States */
    .loading-container, .error-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 4rem 2rem;
      background: white;
      border-radius: 12px;
    }

    .spinner {
      width: 3rem;
      height: 3rem;
      border: 3px solid #f3f3f3;
      border-top: 3px solid #FF385C;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    .loading-container p, .error-container p {
      margin-top: 1rem;
      color: #717171;
      font-size: 0.875rem;
    }

    .error-icon {
      font-size: 3rem;
    }

    .retry-btn {
      margin-top: 1rem;
      padding: 0.625rem 1.25rem;
      background: #FF385C;
      color: white;
      border: none;
      border-radius: 8px;
      font-size: 0.875rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
    }

    .retry-btn:hover {
      background: #E31C5F;
    }

    /* Table Card */
    .table-card {
      background: white;
      border-radius: 12px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
      overflow: hidden;
    }

    .table-header {
      padding: 1.5rem;
      border-bottom: 1px solid #ebebeb;
    }

    .table-header h3 {
      font-size: 1.125rem;
      font-weight: 600;
      color: #222;
      margin: 0;
    }

    /* Empty State */
    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 4rem 2rem;
    }

    .empty-state svg {
      width: 4rem;
      height: 4rem;
      color: #d4d4d4;
      margin-bottom: 1rem;
    }

    .empty-state p {
      color: #717171;
      font-size: 0.875rem;
    }

    /* Table */
    .table-wrapper {
      overflow-x: auto;
    }

    .data-table {
      width: 100%;
      border-collapse: collapse;
    }

    .data-table thead {
      background: #f7f7f7;
    }

    .data-table th {
      padding: 1rem 1.5rem;
      text-align: left;
      font-size: 0.75rem;
      font-weight: 600;
      color: #717171;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .data-table td {
      padding: 1rem 1.5rem;
      border-top: 1px solid #ebebeb;
      font-size: 0.875rem;
    }

    .data-table tbody tr:hover {
      background: #f7f7f7;
    }

    .booking-id {
      font-family: monospace;
      font-size: 0.75rem;
      color: #717171;
    }

    .listing-info, .user-info {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .listing-title, .user-name {
      font-weight: 600;
      color: #222;
    }

    .user-email {
      font-size: 0.75rem;
      color: #717171;
    }

    .price {
      font-weight: 600;
      color: #222;
    }

    /* Status Badges */
    .status-badge {
      display: inline-block;
      padding: 0.25rem 0.75rem;
      border-radius: 12px;
      font-size: 0.75rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .status-confirmed {
      background: #d1fae5;
      color: #065f46;
    }

    .status-pending {
      background: #fef3c7;
      color: #92400e;
    }

    .status-completed {
      background: #dbeafe;
      color: #1e40af;
    }

    .status-cancelled {
      background: #fee2e2;
      color: #991b1b;
    }

    /* Action Buttons */
    .action-buttons {
      display: flex;
      gap: 0.5rem;
    }

    .btn-action {
      padding: 0.5rem;
      border: 1px solid #ebebeb;
      background: white;
      border-radius: 6px;
      cursor: pointer;
      transition: all 0.2s;
    }

    .btn-action svg {
      width: 1.25rem;
      height: 1.25rem;
    }

    .btn-action:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }

    .btn-cancel {
      color: #dc2626;
    }

    .btn-cancel:hover {
      background: #fee2e2;
      border-color: #dc2626;
    }

    .btn-view {
      color: #2563eb;
    }

    .btn-view:hover {
      background: #dbeafe;
      border-color: #2563eb;
    }

    /* Pagination */
    .pagination {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1.5rem;
      border-top: 1px solid #ebebeb;
    }

    .pagination-btn {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.625rem 1rem;
      background: white;
      border: 1px solid #d4d4d4;
      border-radius: 8px;
      font-size: 0.875rem;
      font-weight: 500;
      color: #222;
      cursor: pointer;
      transition: all 0.2s;
    }

    .pagination-btn:not(:disabled):hover {
      background: #f7f7f7;
      border-color: #222;
    }

    .pagination-btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .pagination-btn svg {
      width: 1rem;
      height: 1rem;
    }

    .pagination-info {
      font-size: 0.875rem;
      color: #717171;
    }

    @media (max-width: 768px) {
      .booking-management {
        padding: 1rem;
      }

      .filters-grid {
        grid-template-columns: 1fr;
      }

      .table-wrapper {
        overflow-x: scroll;
      }

      .pagination {
        flex-direction: column;
        gap: 1rem;
      }
    }
  `]
})
export class BookingManagementComponent implements OnInit {
  private adminService = inject(AdminService);

  bookings = signal<BookingManagement[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);

  statusFilter = '';
  searchTerm = '';

  currentPage = signal(0);
  pageSize = signal(10);
  totalPages = signal(0);
  totalElements = signal(0);

  ngOnInit() {
    this.loadBookings();
  }

  loadBookings() {
    this.loading.set(true);
    this.error.set(null);

    this.adminService.getBookings(
      this.currentPage(),
      this.pageSize(),
      this.statusFilter || undefined,
      this.searchTerm || undefined
    ).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.bookings.set(response.data.content);
          this.totalPages.set(response.data.totalPages);
          this.totalElements.set(response.data.totalElements);
        }
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Failed to load bookings');
        this.loading.set(false);
      }
    });
  }

  cancelBooking(bookingId: number, publicId: string) {
    const reason = prompt('Please provide a reason for cancelling this booking:');
    if (!reason) return;

    this.adminService.cancelBooking(publicId, reason).subscribe({
      next: () => {
        alert('Booking cancelled successfully');
        this.loadBookings();
      },
      error: () => {
        alert('Failed to cancel booking');
      }
    });
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }

  onFilterChange() {
    this.currentPage.set(0);
    this.loadBookings();
  }

  onSearch() {
    this.currentPage.set(0);
    this.loadBookings();
  }

  resetFilters() {
    this.statusFilter = '';
    this.searchTerm = '';
    this.currentPage.set(0);
    this.loadBookings();
  }

  nextPage() {
    if (this.currentPage() < this.totalPages() - 1) {
      this.currentPage.update(p => p + 1);
      this.loadBookings();
    }
  }

  previousPage() {
    if (this.currentPage() > 0) {
      this.currentPage.update(p => p - 1);
      this.loadBookings();
    }
  }
}
