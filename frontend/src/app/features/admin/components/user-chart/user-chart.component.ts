import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { NgxEchartsModule } from 'ngx-echarts';
import { EChartsOption } from 'echarts';
import { DashboardService } from '../../services/dashboard.service';

@Component({
  selector: 'app-user-chart',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonToggleModule, NgxEchartsModule],
  templateUrl: './user-chart.component.html'
})
export class UserChartComponent implements OnInit {
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

    this.dashboardService.getUserChart(+this.selectedPeriod).subscribe({
      next: (data) => {
        // Area Chart
        this.chartOption.set({
          backgroundColor: 'transparent',
          tooltip: {
            trigger: 'axis',
            backgroundColor: 'rgba(45, 45, 45, 0.95)',
            borderColor: '#5D4037',
            textStyle: { color: '#E0E0E0' }
          },
          legend: {
            data: ['Total Users', 'Active Users', 'New Users'],
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
            data: data.userGrowth.map(d => d.label),
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
              name: 'Total Users',
              type: 'line',
              smooth: true,
              data: data.userGrowth.map(d => d.totalUsers),
              itemStyle: { color: '#42A5F5' },
              areaStyle: {
                color: {
                  type: 'linear',
                  x: 0, y: 0, x2: 0, y2: 1,
                  colorStops: [
                    { offset: 0, color: 'rgba(66, 165, 245, 0.3)' },
                    { offset: 1, color: 'rgba(66, 165, 245, 0.05)' }
                  ]
                }
              }
            },
            {
              name: 'Active Users',
              type: 'line',
              smooth: true,
              data: data.userGrowth.map(d => d.activeUsers),
              itemStyle: { color: '#66BB6A' }
            },
            {
              name: 'New Users',
              type: 'bar',
              data: data.userGrowth.map(d => d.newUsers),
              itemStyle: { color: '#FFA726' }
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
            textStyle: { color: '#E0E0E0' }
          },
          series: [
            {
              name: 'User Type',
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
              data: data.userTypes.map(u => ({
                value: u.count,
                name: u.userType
              })),
              color: ['#42A5F5', '#66BB6A', '#FFA726', '#AB47BC']
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
