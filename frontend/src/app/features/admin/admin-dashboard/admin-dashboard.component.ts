import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DashboardService } from '../services/dashboard.service';
import { DashboardStats } from '../services/dashboard.models';

// Chart components
import { KpiCardsComponent } from '../components/kpi-cards/kpi-cards.component';
import { RevenueChartComponent } from '../components/revenue-chart/revenue-chart.component';
import { BookingChartComponent } from '../components/booking-chart/booking-chart.component';
import { UserChartComponent } from '../components/user-chart/user-chart.component';
import { ListingChartComponent } from '../components/listing-chart/listing-chart.component';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    KpiCardsComponent,
    RevenueChartComponent,
    BookingChartComponent,
    UserChartComponent,
    ListingChartComponent
  ],
  templateUrl: './admin-dashboard.component.html',
  styleUrl: './admin-dashboard.component.css'
})
export class AdminDashboardComponent implements OnInit {
  private dashboardService = inject(DashboardService);
  
  startDate = signal<string>('');
  endDate = signal<string>('');
  selectedUserId = signal<string | null>(null);

  stats = signal<DashboardStats | null>(null);
  loading = signal(true);
  error = signal<string | null>(null);
  selectedPeriod = signal<number>(30);

  // Active tab
  activeTab = signal<'overview' | 'users' | 'listings' | 'bookings' | 'revenue' | 'reports' | 'settings'>('overview');

  ngOnInit() {
    this.loadDashboardData();
  }

  loadDashboardData() {
    this.loading.set(true);
    this.error.set(null);
    
    const params: any = {};
    if (this.startDate()) params.startDate = this.startDate();
    if (this.endDate()) params.endDate = this.endDate();
    if (this.selectedUserId()) params.userPublicId = this.selectedUserId();
    
    this.dashboardService.getDashboardStats(params).subscribe({
      next: (response: any) => {
        // Handle both ApiResponse and direct data
        const data = response.data || response;
        this.stats.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error loading dashboard data:', err);
        this.error.set('Failed to load dashboard data. Please try again.');
        this.loading.set(false);
      }
    });
  }

  setDateRange(days: number) {
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - days);
    
    this.startDate.set(start.toISOString().split('T')[0]);
    this.endDate.set(end.toISOString().split('T')[0]);
    this.selectedPeriod.set(days);
    this.loadDashboardData();
  }
  
  resetDateRange() {
    this.startDate.set('');
    this.endDate.set('');
    this.selectedUserId.set(null);
    this.loadDashboardData();
  }
  
  onDateRangeChange() {
    if (this.startDate() && this.endDate()) {
      this.loadDashboardData();
    }
  }
  
  applyFilters() {
    this.loadDashboardData();
  }

  onPeriodChange(days: number) {
    this.selectedPeriod.set(days);
    this.setDateRange(days);
  }

  refresh() {
    this.loadDashboardData();
  }
}
