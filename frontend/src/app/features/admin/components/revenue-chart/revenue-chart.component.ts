import { Component, OnInit, OnChanges, Input, SimpleChanges, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { NgxEchartsModule } from 'ngx-echarts';
import { EChartsOption } from 'echarts';
import { DashboardService } from '../../services/dashboard.service';

@Component({
  selector: 'app-revenue-chart',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonToggleModule, NgxEchartsModule],
  templateUrl: './revenue-chart.component.html'
})
export class RevenueChartComponent implements OnInit, OnChanges {
  private dashboardService = inject(DashboardService);

  @Input() days: number = 30;

  loading = signal(false);
  chartOption = signal<EChartsOption | null>(null);
  pieChartOption = signal<EChartsOption | null>(null);

  ngOnInit() {
    this.loadChart();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['days'] && !changes['days'].firstChange) {
      this.loadChart();
    }
  }

  loadChart() {
    this.loading.set(true);

    this.dashboardService.getRevenueChart(this.days).subscribe({
      next: (data) => {
        // Line Chart
        this.chartOption.set({
          backgroundColor: 'transparent',
          tooltip: {
            trigger: 'axis',
            backgroundColor: 'rgba(45, 45, 45, 0.95)',
            borderColor: '#5D4037',
            textStyle: { color: '#E0E0E0' }
          },
          legend: {
            data: ['Revenue', 'Transactions'],
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
            boundaryGap: false,
            data: data.dailyRevenue.map(d => d.label),
            axisLine: { lineStyle: { color: '#5D4037' } },
            axisLabel: { color: '#B0B0B0' }
          },
          yAxis: [
            {
              type: 'value',
              name: 'Revenue ($)',
              position: 'left',
              axisLine: { lineStyle: { color: '#5D4037' } },
              axisLabel: { color: '#B0B0B0', formatter: '${value}' },
              splitLine: { lineStyle: { color: '#3A3A3A' } }
            },
            {
              type: 'value',
              name: 'Count',
              position: 'right',
              axisLine: { lineStyle: { color: '#5D4037' } },
              axisLabel: { color: '#B0B0B0' },
              splitLine: { show: false }
            }
          ],
          series: [
            {
              name: 'Revenue',
              type: 'line',
              smooth: true,
              data: data.dailyRevenue.map(d => d.value),
              itemStyle: { color: '#66BB6A' },
              areaStyle: {
                color: {
                  type: 'linear',
                  x: 0, y: 0, x2: 0, y2: 1,
                  colorStops: [
                    { offset: 0, color: 'rgba(102, 187, 106, 0.3)' },
                    { offset: 1, color: 'rgba(102, 187, 106, 0.05)' }
                  ]
                }
              }
            },
            {
              name: 'Transactions',
              type: 'bar',
              yAxisIndex: 1,
              data: data.dailyRevenue.map(d => d.count),
              itemStyle: { color: '#42A5F5' }
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
            formatter: '{b}: ${c} ({d}%)'
          },
          legend: {
            orient: 'vertical',
            left: 'left',
            textStyle: { color: '#E0E0E0' }
          },
          series: [
            {
              name: 'Payment Methods',
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
              data: data.paymentMethods.map(pm => ({
                value: pm.amount,
                name: pm.method
              })),
              color: ['#66BB6A', '#42A5F5', '#FFA726', '#EF5350', '#AB47BC']
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
