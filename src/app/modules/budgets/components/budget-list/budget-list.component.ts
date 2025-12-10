import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Budget } from '../../../../core/models';
import { BudgetService } from '../../../../core/services';

@Component({
  selector: 'app-budget-list',
  templateUrl: './budget-list.component.html',
  styleUrls: ['./budget-list.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BudgetListComponent implements OnInit, OnDestroy {
  Math = Math;
  budgets: Budget[] = [];
  currentMonth: string;
  loading = false;
  budgetUtilization: { [key: string]: number } = {};
  budgetExceeded: { [key: string]: boolean } = {};
  private destroy$ = new Subject<void>();

  constructor(
    private budgetService: BudgetService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {
    const now = new Date();
    this.currentMonth = now.toISOString().substring(0, 7);
  }

  ngOnInit(): void {
    this.loadBudgets();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadBudgets(): void {
    this.loading = true;
    this.budgetService.getAll()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.budgets = data;
          this.loadBudgetMetrics();
          this.loading = false;
          this.cdr.markForCheck();
        },
        error: (err) => {
          console.error('Erreur lors du chargement des budgets', err);
          this.loading = false;
          this.cdr.markForCheck();
        }
      });
  }

  loadBudgetMetrics(): void {
    this.budgets.forEach(budget => {
      const percentage = budget.spent && budget.limit ? (budget.spent / budget.limit) * 100 : 0;
      this.budgetUtilization[budget.id] = Math.round(percentage);
      
      this.budgetExceeded[budget.id] = budget.spent > budget.limit;
    });
  }

  newBudget(): void {
    this.router.navigate(['/budgets/new']);
  }

  editBudget(id: string): void {
    this.router.navigate(['/budgets', id, 'edit']);
  }

  viewBudget(id: string): void {
    this.router.navigate(['/budgets', id]);
  }

  deleteBudget(id: string): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce budget?')) {
      this.budgetService.delete(id)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.loadBudgets();
          },
          error: (err) => {
            console.error('Erreur lors de la suppression', err);
          }
        });
    }
  }

  getUtilizationPercentage(id: string): number {
    return this.budgetUtilization[id] || 0;
  }

  getIsExceeded(id: string): boolean {
    return this.budgetExceeded[id] || false;
  }

  isExceeded(id: string): boolean {
    return this.getIsExceeded(id);
  }

  getProgressColor(percentage: number): string {
    if (percentage > 100) return 'danger';
    if (percentage > 80) return 'warning';
    return 'success';
  }
}
