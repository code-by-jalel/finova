import { Component, OnInit, OnDestroy } from '@angular/core';
import { ChartConfiguration } from 'chart.js';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { DashboardData } from '../../../../core/models';
import { DashboardService } from '../../../../core/services';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit, OnDestroy {
  Math = Math;
  dashboardData: DashboardData | null = null;
  loading = true;

  monthlyExpensesChart!: ChartConfiguration;
  expensesByCategoryChart!: ChartConfiguration;
  monthlyIncomeChart!: ChartConfiguration;

  private destroy$ = new Subject<void>();

  constructor(private dashboardService: DashboardService) {}

  ngOnInit(): void {
    this.loadDashboardData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadDashboardData(): void {
    this.loading = true;
    this.dashboardService.getDashboardData()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.dashboardData = data;
          this.initializeCharts();
          this.loading = false;
        },
        error: (err) => {
          console.error('Erreur lors du chargement du dashboard', err);
          this.loading = false;
        }
      });
  }

  initializeCharts(): void {
    if (!this.dashboardData) return;

    this.monthlyExpensesChart = {
      type: 'bar',
      data: {
        labels: this.dashboardData.monthlyExpenses.map(m => m.month),
        datasets: [
          {
            label: 'Dépenses mensuelles',
            data: this.dashboardData.monthlyExpenses.map(m => m.amount),
            backgroundColor: '#dc3545',
            borderColor: '#c82333',
            borderWidth: 1
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
          legend: {
            position: 'top'
          }
        },
        scales: {
          y: {
            beginAtZero: true
          }
        }
      }
    };

    this.expensesByCategoryChart = {
      type: 'doughnut',
      data: {
        labels: this.dashboardData.expensesByCategory.map(c => c.category),
        datasets: [
          {
            label: 'Dépenses par catégorie',
            data: this.dashboardData.expensesByCategory.map(c => c.amount),
            backgroundColor: [
              '#667eea',
              '#764ba2',
              '#f093fb',
              '#4facfe',
              '#00f2fe',
              '#43e97b'
            ],
            borderColor: '#fff',
            borderWidth: 2
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
          legend: {
            position: 'bottom'
          }
        }
      }
    };

    this.monthlyIncomeChart = {
      type: 'bar',
      data: {
        labels: this.dashboardData.monthlyIncome.map(m => m.month),
        datasets: [
          {
            label: 'Revenus mensuels',
            data: this.dashboardData.monthlyIncome.map(m => m.amount),
            backgroundColor: '#28a745',
            borderColor: '#1e7e34',
            borderWidth: 1
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
          legend: {
            position: 'top'
          }
        },
        scales: {
          y: {
            beginAtZero: true
          }
        }
      }
    };
  }

  getGrowthIcon(): string {
    return this.dashboardData && this.dashboardData.growthPercentage >= 0 ? '📈' : '📉';
  }

  getGrowthColor(): string {
    return this.dashboardData && this.dashboardData.growthPercentage >= 0 ? 'success' : 'danger';
  }
}
