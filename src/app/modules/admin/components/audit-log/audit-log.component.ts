import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AuditLog } from '../../../../core/models';
import { DashboardService } from '../../../../core/services';

@Component({
  selector: 'app-audit-log',
  templateUrl: './audit-log.component.html',
  styleUrls: ['./audit-log.component.css']
})
export class AuditLogComponent implements OnInit, OnDestroy {
  auditLogs: AuditLog[] = [];
  filteredLogs: AuditLog[] = [];
  searchQuery = '';
  filterAction: string = 'all';
  loading = false;
  currentPage = 1;
  pageSize = 10;
  totalItems = 0;

  actions: string[] = [
    'CREATE_TRANSACTION',
    'UPDATE_TRANSACTION',
    'APPROVE_TRANSACTION',
    'REJECT_TRANSACTION',
    'DELETE_TRANSACTION',
    'CREATE_BUDGET',
    'UPDATE_BUDGET',
    'DELETE_BUDGET',
    'CREATE_WALLET',
    'UPDATE_WALLET'
  ];

  private destroy$ = new Subject<void>();

  constructor(private dashboardService: DashboardService) {}

  ngOnInit(): void {
    this.loadAuditLogs();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadAuditLogs(): void {
    this.loading = true;
    this.loading = false;
  }

  applyFilters(): void {
    let filtered = this.auditLogs;

    if (this.searchQuery) {
      filtered = filtered.filter(log =>
        log.action.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        log.resourceId.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        log.userId.toLowerCase().includes(this.searchQuery.toLowerCase())
      );
    }

    if (this.filterAction !== 'all') {
      filtered = filtered.filter(log => log.action === this.filterAction);
    }

    this.totalItems = filtered.length;
    this.filteredLogs = filtered.slice(
      (this.currentPage - 1) * this.pageSize,
      this.currentPage * this.pageSize
    );
  }

  onSearch(): void {
    this.currentPage = 1;
    this.applyFilters();
  }

  onFilterChange(): void {
    this.currentPage = 1;
    this.applyFilters();
  }

  getActionIcon(action: string): string {
    const icons: { [key: string]: string } = {
      'CREATE': '➕',
      'UPDATE': '✏️',
      'DELETE': '🗑️',
      'APPROVE': '✅',
      'REJECT': '❌'
    };
    for (const [key, icon] of Object.entries(icons)) {
      if (action.includes(key)) {
        return icon;
      }
    }
    return '📝';
  }

  getActionColor(action: string): string {
    const colors: { [key: string]: string } = {
      'CREATE': '#28a745',
      'UPDATE': '#17a2b8',
      'DELETE': '#dc3545',
      'APPROVE': '#20c997',
      'REJECT': '#fd7e14'
    };
    for (const [key, color] of Object.entries(colors)) {
      if (action.includes(key)) {
        return color;
      }
    }
    return '#6c757d';
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.applyFilters();
    }
  }

  nextPage(): void {
    if (this.currentPage < Math.ceil(this.totalItems / this.pageSize)) {
      this.currentPage++;
      this.applyFilters();
    }
  }

  Math = Math;
}
