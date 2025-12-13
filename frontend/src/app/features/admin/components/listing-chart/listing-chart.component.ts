import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { NgxEchartsModule } from 'ngx-echarts';
import { EChartsOption } from 'echarts';
import { DashboardService } from '../../services/dashboard.service';

@Component({
  selector: 'app-listing-chart',
  standalone: true,
  imports: [CommonModule, MatCardModule, NgxEchartsModule],
  templateUrl: './listing-chart.component.html'
})
export class ListingChartComponent implements OnInit {
  private dashboardService = inject(DashboardService);

  loading = signal(false);
  chartOption = signal<EChartsOption | null>(null);
  barChartOption = signal<EChartsOption | null>(null);

  ngOnInit() {
    this.loadChart();
  }

  loadChart() {
    this.loading.set(true);

    this.dashboardService.getListingChart().subscribe({
      next: (data) => {
        // Pie Chart
        this.chartOption.set({
          backgroundColor: 'transparent',
          tooltip: {
            trigger: 'item',
            backgroundColor: 'rgba(45, 45, 45, 0.95)',
            borderColor: '#5D4037',
            textStyle: { color: '#E0E0E0' },
            formatter: '{b}: {c} listings ({d}%)'
          },
          legend: {
            orient: 'vertical',
            left: 'left',
            textStyle: { color: '#E0E0E0' }
          },
          series: [
            {
              name: 'Property Type',
              type: 'pie',
              radius: ['40%', '70%'],
              itemStyle: {
                borderRadius: 10,
                borderColor: '#1E1E1E',
                borderWidth: 2
              },
              label: {
                show: true,
                formatter: '{b}\n{d}%',
                color: '#E0E0E0'
              },
              emphasis: {
                label: {
                  show: true,
                  fontSize: 14,
                  fontWeight: 'bold'
                }
              },
              data: data.listingsByType.map(l => ({
                value: l.count,
                name: l.propertyType
              })),
              color: ['#42A5F5', '#66BB6A', '#FFA726', '#EF5350', '#AB47BC', '#26C6DA']
            }
          ]
        });

        // Bar Chart
        this.barChartOption.set({
          backgroundColor: 'transparent',
          tooltip: {
            trigger: 'axis',
            backgroundColor: 'rgba(45, 45, 45, 0.95)',
            borderColor: '#5D4037',
            textStyle: { color: '#E0E0E0' },
            formatter: '{b}: ${c}'
          },
          grid: {
            left: '3%',
            right: '4%',
            bottom: '3%',
            containLabel: true
          },
          xAxis: {
            type: 'value',
            axisLine: { lineStyle: { color: '#5D4037' } },
            axisLabel: { color: '#B0B0B0', formatter: '${value}' },
            splitLine: { lineStyle: { color: '#3A3A3A' } }
          },
          yAxis: {
            type: 'category',
            data: data.listingsByType.map(l => l.propertyType),
            axisLine: { lineStyle: { color: '#5D4037' } },
            axisLabel: { color: '#B0B0B0' }
          },
          series: [
            {
              name: 'Average Price',
              type: 'bar',
              data: data.listingsByType.map(l => l.averagePrice),
              itemStyle: {
                color: {
                  type: 'linear',
                  x: 0, y: 0, x2: 1, y2: 0,
                  colorStops: [
                    { offset: 0, color: '#5D4037' },
                    { offset: 1, color: '#42A5F5' }
                  ]
                }
              },
              label: {
                show: true,
                position: 'right',
                formatter: '${c}',
                color: '#E0E0E0'
              }
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
