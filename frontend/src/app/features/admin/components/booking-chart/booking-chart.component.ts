import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { NgxEchartsModule } from 'ngx-echarts';
import { EChartsOption } from 'echarts';
import { DashboardService } from '../../services/dashboard.service';

@Component({
  selector: 'app-booking-chart',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonToggleModule, NgxEchartsModule],
  template: `
    <mat-card class="admin-chart-container">
      <div class="flex justify-between items-center mb-6">
        <div>
          <h3 class="text-xl font-semibold" style="color: var(--admin-text-primary)">Booking Analytics</h3>
          <p class="text-sm" style="color: var(--admin-text-secondary)">
            Booking trends and status distribution
          </p>
        </div>
        <mat-button-toggle-group [(value)]="selectedPeriod" (change)="loadChart()">
          <mat-button-toggle value="7">7 Days</mat-button-toggle>
          <mat-button-toggle value="30">30 Days</mat-button-toggle>
          <mat-button-toggle value="90">90 Days</mat-button-toggle>
        </mat-button-toggle-group>
      </div>

      @if (loading()) {
        <div class="flex justify-center items-center h-96">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2" 
               style="border-color: var(--admin-primary)"></div>
        </div>
      } @else if (chartOption()) {
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <!-- Trend Chart -->
          <div class="lg:col-span-2">
            <div echarts [options]="chartOption()!" class="h-96"></div>
          </div>
          
          <!-- Status Distribution Pie -->
          <div>
            <h4 class="text-sm font-semibold mb-3" style="color: var(--admin-text-primary)">
              Status Distribution
            </h4>
            @if (pieChartOption()) {
              <div echarts [options]="pieChartOption()!" class="h-96"></div>
            }
          </div>
        </div>
      }
    </mat-card>
  `
})
export class BookingChartComponent implements OnInit {
  private dashboardService = inject(DashboardService);
  
  selectedPeriod = '30';
  loading = signal(false);
  chartOption = signal<EChartsOption | null>(null);
  pieChartOption = signal<EChartsOption | null>(null);

  ngOnInit() {
    this.loadChart();
  }

  loadChart() {
    this.loading.set(true);
    
    this.dashboardService.getBookingChart(+this.selectedPeriod).subscribe({
      next: (data) => {
        // Line/Bar Chart
        this.chartOption.set({
          backgroundColor: 'transparent',
          tooltip: {
            trigger: 'axis',
            backgroundColor: 'rgba(45, 45, 45, 0.95)',
            borderColor: '#5D4037',
            textStyle: { color: '#E0E0E0' }
          },
          legend: {
            data: ['Bookings', 'Completions', 'Cancellations'],
            textStyle: { color: '#E0E0E0' }
          },
          grid: {
            left: '3%',
            right: '4%',
            bottom: '3%',
            containLabel: true
          },
          xAxis: {
            type: 'category',
            data: data.bookingTrends.map(d => d.label),
            axisLine: { lineStyle: { color: '#5D4037' } },
            axisLabel: { color: '#B0B0B0', rotate: 45 }
          },
          yAxis: {
            type: 'value',
            axisLine: { lineStyle: { color: '#5D4037' } },
            axisLabel: { color: '#B0B0B0' },
            splitLine: { lineStyle: { color: '#3A3A3A' } }
          },
          series: [
            {
              name: 'Bookings',
              type: 'bar',
              data: data.bookingTrends.map(d => d.bookings),
              itemStyle: { color: '#42A5F5' }
            },
            {
              name: 'Completions',
              type: 'line',
              smooth: true,
              data: data.bookingTrends.map(d => d.completions),
              itemStyle: { color: '#66BB6A' }
            },
            {
              name: 'Cancellations',
              type: 'line',
              smooth: true,
              data: data.bookingTrends.map(d => d.cancellations),
              itemStyle: { color: '#EF5350' }
            }
          ]
        });

        // Pie Chart
        this.pieChartOption.set({
          backgroundColor: 'transparent',
          tooltip: {
            trigger: 'item',
            backgroundColor: 'rgba(45, 45, 45, 0.95)',
            borderColor: '#5D4037',
            textStyle: { color: '#E0E0E0' },
            formatter: '{b}: {c} ({d}%)'
          },
          legend: {
            orient: 'vertical',
            left: 'left',
            textStyle: { color: '#E0E0E0', fontSize: 11 }
          },
          series: [
            {
              name: 'Status',
              type: 'pie',
              radius: ['40%', '70%'],
              avoidLabelOverlap: false,
              itemStyle: {
                borderRadius: 10,
                borderColor: '#1E1E1E',
                borderWidth: 2
              },
              label: {
                show: true,
                formatter: '{d}%',
                color: '#E0E0E0'
              },
              emphasis: {
                label: {
                  show: true,
                  fontSize: 14,
                  fontWeight: 'bold'
                }
              },
              data: data.statusDistribution.map(s => ({
                value: s.count,
                name: s.status
              })),
              color: ['#42A5F5', '#66BB6A', '#FFA726', '#EF5350', '#AB47BC']
            }
          ]
        });

        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      }
    });
  }
}
