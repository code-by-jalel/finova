import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Alert } from '../../../../core/models';
import { DashboardService } from '../../../../core/services';

@Component({
  selector: 'app-alerts-dashboard',
  templateUrl: './alerts-dashboard.component.html',
  styleUrls: ['./alerts-dashboard.component.css']
})
export class AlertsDashboardComponent implements OnInit, OnDestroy {
  alerts: Alert[] = [];
  filteredAlerts: Alert[] = [];
  filterSeverity: 'all' | 'danger' | 'warning' | 'info' = 'all';
  loading = false;
  readingId: string | null = null;

  severities: string[] = ['danger', 'warning', 'info'];

  private destroy$ = new Subject<void>();

  constructor(private dashboardService: DashboardService) {}

  ngOnInit(): void {
    this.loadAlerts();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadAlerts(): void {
    this.loading = true;
    this.dashboardService.getDashboardData()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.alerts = data.alerts || [];
          this.alerts.sort((a, b) => {
            const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
            const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
            return bTime - aTime;
          });
          this.applyFilters();
          this.loading = false;
        },
        error: (err) => {
          console.error('Erreur lors du chargement des alertes:', err);
          this.loading = false;
        }
      });
  }

  applyFilters(): void {
    let filtered = this.alerts;

    if (this.filterSeverity !== 'all') {
      filtered = filtered.filter(alert => alert.severity === this.filterSeverity);
    }

    this.filteredAlerts = filtered;
  }

  onFilterChange(): void {
    this.applyFilters();
  }

  markAsRead(alert: Alert): void {
    if (alert.read) return;
    
    this.readingId = alert.id;
    alert.read = true;
    this.readingId = null;
  }

  dismissAlert(alert: Alert): void {
    const index = this.alerts.indexOf(alert);
    if (index > -1) {
      this.alerts.splice(index, 1);
      this.applyFilters();
    }
  }

  getSeverityIcon(severity: string): string {
    const icons: { [key: string]: string } = {
      'danger': '🔴',
      'warning': '🟡',
      'info': '🔵'
    };
    return icons[severity] || '⚪';
  }

  getSeverityClass(severity: string): string {
    const classes: { [key: string]: string } = {
      'danger': 'severity-danger',
      'warning': 'severity-warning',
      'info': 'severity-info'
    };
    return classes[severity] || 'severity-info';
  }

  getSeverityLabel(severity: string): string {
    const labels: { [key: string]: string } = {
      'danger': 'Critique',
      'warning': 'Attention',
      'info': 'Information'
    };
    return labels[severity] || severity;
  }

  getUnreadCount(): number {
    return this.alerts.filter(a => !a.read).length;
  }

  markAllAsRead(): void {
    this.alerts.forEach(alert => alert.read = true);
    this.applyFilters();
  }

  dismissAll(): void {
    this.alerts = [];
    this.applyFilters();
  }
}
