import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ServiceOfferingService } from '../services/service-offering.service';
import {
  ServiceOffering,
  ServiceStatus,
  SERVICE_CATEGORY_LABELS,
  PRICING_TYPE_LABELS
} from '../models/service-offering.model';

@Component({
  selector: 'app-provider-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './provider-dashboard.component.html',
  styleUrls: ['./provider-dashboard.component.css']
})
export class ProviderDashboardComponent implements OnInit {
  private serviceService = inject(ServiceOfferingService);
  private router = inject(Router);

  // State
  services = signal<ServiceOffering[]>([]);
  filteredServices = signal<ServiceOffering[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);

  // Filters
  selectedStatus = signal<ServiceStatus | 'ALL'>('ALL');
  searchKeyword = signal('');
  sortBy = signal<'title' | 'createdAt' | 'basePrice' | 'averageRating'>('createdAt');
  sortDirection = signal<'asc' | 'desc'>('desc');
  viewMode = signal<'grid' | 'list'>('grid');

  // Labels
  ServiceStatus = ServiceStatus;
  categoryLabels = SERVICE_CATEGORY_LABELS;
  pricingLabels = PRICING_TYPE_LABELS;

  // Stats
  totalServices = signal(0);
  activeServices = signal(0);
  draftServices = signal(0);
  pausedServices = signal(0);
  pendingServices = signal(0);

  // Status options
  statusOptions = [
    { value: 'ALL', label: 'All Services' },
    { value: ServiceStatus.ACTIVE, label: 'Active' },
    { value: ServiceStatus.DRAFT, label: 'Draft' },
    { value: ServiceStatus.PAUSED, label: 'Paused' },
    { value: ServiceStatus.PENDING_APPROVAL, label: 'Pending Approval' },
    { value: ServiceStatus.SUSPENDED, label: 'Suspended' },
    { value: ServiceStatus.REJECTED, label: 'Rejected' },
    { value: ServiceStatus.INACTIVE, label: 'Inactive' }
  ];

  ngOnInit() {
    this.loadServices();
  }

  loadServices() {
    this.loading.set(true);
    this.error.set(null);

    this.serviceService.getMyServices().subscribe({
      next: (response) => {
        this.services.set(response.data);
        this.applyFilters();
        this.updateStats();
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error loading services:', err);
        this.error.set('Failed to load services. Please try again.');
        this.loading.set(false);
      }
    });
  }

  applyFilters() {
    let filtered = [...this.services()];

    // Status filter
    if (this.selectedStatus() !== 'ALL') {
      filtered = filtered.filter(s => s.status === this.selectedStatus());
    }

    // Search filter
    const keyword = this.searchKeyword().toLowerCase();
    if (keyword) {
      filtered = filtered.filter(s =>
        s.title.toLowerCase().includes(keyword) ||
        s.city.toLowerCase().includes(keyword) ||
        this.categoryLabels[s.category].toLowerCase().includes(keyword)
      );
    }

    // Sort
    filtered.sort((a, b) => {
      let aValue: string | number = a[this.sortBy() as keyof ServiceOffering] as string | number;
      let bValue: string | number = b[this.sortBy() as keyof ServiceOffering] as string | number;

      if (this.sortBy() === 'createdAt') {
        aValue = new Date(aValue as string).getTime();
        bValue = new Date(bValue as string).getTime();
      }

      if (this.sortDirection() === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    this.filteredServices.set(filtered);
  }

  updateStats() {
    const services = this.services();
    this.totalServices.set(services.length);
    this.activeServices.set(services.filter(s => s.status === ServiceStatus.ACTIVE).length);
    this.draftServices.set(services.filter(s => s.status === ServiceStatus.DRAFT).length);
    this.pausedServices.set(services.filter(s => s.status === ServiceStatus.PAUSED).length);
    this.pendingServices.set(services.filter(s => s.status === ServiceStatus.PENDING_APPROVAL).length);
  }

  filterByStatus(status: ServiceStatus | 'ALL') {
    this.selectedStatus.set(status);
    this.applyFilters();
  }

  search(keyword: string) {
    this.searchKeyword.set(keyword);
    this.applyFilters();
  }

  changeSortBy(sortBy: 'title' | 'createdAt' | 'basePrice' | 'averageRating') {
    if (this.sortBy() === sortBy) {
      // Toggle direction
      this.sortDirection.set(this.sortDirection() === 'asc' ? 'desc' : 'asc');
    } else {
      this.sortBy.set(sortBy);
      this.sortDirection.set('desc');
    }
    this.applyFilters();
  }

  toggleViewMode() {
    this.viewMode.set(this.viewMode() === 'grid' ? 'list' : 'grid');
  }

  editService(service: ServiceOffering) {
    this.router.navigate(['/service-offering/edit', service.publicId]);
  }

  viewService(service: ServiceOffering) {
    this.router.navigate(['/service-offering', service.publicId]);
  }

  toggleServiceStatus(service: ServiceOffering) {
    const newStatus = service.status === ServiceStatus.ACTIVE ? ServiceStatus.PAUSED : ServiceStatus.ACTIVE;

    this.serviceService.updateServiceStatus(service.publicId, newStatus).subscribe({
      next: () => {
        this.loadServices();
      },
      error: (err) => {
        console.error('Error updating service status:', err);
        alert('Failed to update service status');
      }
    });
  }

  deleteService(service: ServiceOffering) {
    if (!confirm(`Are you sure you want to delete "${service.title}"? This action cannot be undone.`)) {
      return;
    }

    this.serviceService.deleteService(service.publicId).subscribe({
      next: () => {
        this.loadServices();
      },
      error: (err) => {
        console.error('Error deleting service:', err);
        alert('Failed to delete service');
      }
    });
  }

  createNewService() {
    this.router.navigate(['/service-offering/create']);
  }

  getStatusClass(status: ServiceStatus): string {
    switch (status) {
      case ServiceStatus.ACTIVE:
        return 'status-active';
      case ServiceStatus.DRAFT:
        return 'status-draft';
      case ServiceStatus.PAUSED:
        return 'status-paused';
      case ServiceStatus.PENDING_APPROVAL:
        return 'status-pending';
      case ServiceStatus.SUSPENDED:
      case ServiceStatus.REJECTED:
        return 'status-rejected';
      default:
        return 'status-inactive';
    }
  }

  getStatusLabel(status: ServiceStatus): string {
    const labels: Record<ServiceStatus, string> = {
      [ServiceStatus.ACTIVE]: 'Active',
      [ServiceStatus.DRAFT]: 'Draft',
      [ServiceStatus.PAUSED]: 'Paused',
      [ServiceStatus.PENDING_APPROVAL]: 'Pending',
      [ServiceStatus.SUSPENDED]: 'Suspended',
      [ServiceStatus.REJECTED]: 'Rejected',
      [ServiceStatus.INACTIVE]: 'Inactive'
    };
    return labels[status];
  }
}
