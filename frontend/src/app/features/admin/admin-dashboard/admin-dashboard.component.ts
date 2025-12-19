import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
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
    
    this.dashboardService.getDashboardStats().subscribe({
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

  onPeriodChange(days: number) {
    this.selectedPeriod.set(days);
    // Charts will react to this change
  }

  refresh() {
    this.loadDashboardData();
  }
}
