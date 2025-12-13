import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTabsModule } from '@angular/material/tabs';
import { DashboardService } from '../../services/dashboard.service';
import { DashboardStats } from '../../services/dashboard.models';
import { KpiCardsComponent } from '../kpi-cards/kpi-cards.component';
import { RevenueChartComponent } from '../revenue-chart/revenue-chart.component';
import { BookingChartComponent } from '../booking-chart/booking-chart.component';
import { UserChartComponent } from '../user-chart/user-chart.component';
import { ListingChartComponent } from '../listing-chart/listing-chart.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatGridListModule,
    MatIconModule,
    MatButtonModule,
    MatTabsModule,
    KpiCardsComponent,
    RevenueChartComponent,
    BookingChartComponent,
    UserChartComponent,
    ListingChartComponent
  ],
  templateUrl: './dashboard.component.html'
})
export class DashboardComponent implements OnInit {
  private dashboardService = inject(DashboardService);

  stats = signal<DashboardStats | null>(null);
  loading = signal(false);
  error = signal<string | null>(null);

  ngOnInit() {
    this.loadDashboard();
  }

  loadDashboard() {
    this.loading.set(true);
    this.error.set(null);

    this.dashboardService.getDashboardStats().subscribe({
      next: (data) => {
        this.stats.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err.message || 'Failed to load dashboard data');
        this.loading.set(false);
      }
    });
  }
}
