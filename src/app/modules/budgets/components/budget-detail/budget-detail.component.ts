import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, combineLatest } from 'rxjs';
import { takeUntil, switchMap, map } from 'rxjs/operators';
import { Budget, Transaction } from '../../../../core/models';
import { BudgetService, TransactionService } from '../../../../core/services';

@Component({
  selector: 'app-budget-detail',
  templateUrl: './budget-detail.component.html',
  styleUrls: ['./budget-detail.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BudgetDetailComponent implements OnInit, OnDestroy {
  Math = Math;
  budget: Budget | null = null;
  relatedTransactions: Transaction[] = [];
  loading = true;
  utilizationPercentage = 0;
  budgetExceeded = false;
  private destroy$ = new Subject<void>();

  constructor(
    private budgetService: BudgetService,
    private transactionService: TransactionService,
    private route: ActivatedRoute,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.route.params
      .pipe(
        switchMap(params => {
          const id = params['id'];
          return combineLatest([
            this.budgetService.getById(id),
            this.transactionService.getAll()
          ]);
        }),
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: ([budget, transactions]) => {
          this.budget = budget;
          if (this.budget) {
            this.relatedTransactions = transactions.filter(
              t => t.category === this.budget!.category && t.type === 'expense'
            );
            this.loadBudgetMetrics();
          }
          this.loading = false;
          this.cdr.markForCheck();
        },
        error: (err) => {
          console.error('Erreur lors du chargement du budget', err);
          this.loading = false;
          this.cdr.markForCheck();
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadBudgetMetrics(): void {
    if (!this.budget) return;

    // Calcul local sans appel API
    const percentage = this.budget.spent && this.budget.limit 
      ? Math.round((this.budget.spent / this.budget.limit) * 100) 
      : 0;
    
    this.utilizationPercentage = percentage;
    this.budgetExceeded = this.budget.spent > this.budget.limit;
  }

  edit(): void {
    if (this.budget) {
      this.router.navigate(['/budgets', this.budget.id, 'edit']);
    }
  }

  delete(): void {
    if (this.budget && confirm('Êtes-vous sûr de vouloir supprimer ce budget?')) {
      this.budgetService.delete(this.budget.id)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.router.navigate(['/budgets']);
          },
          error: (err) => {
            console.error('Erreur lors de la suppression', err);
          }
        });
    }
  }

  back(): void {
    this.router.navigate(['/budgets']);
  }

  getUtilizationPercentage(): number {
    return this.utilizationPercentage;
  }

  isExceeded(): boolean {
    return this.budgetExceeded;
  }

  getProgressColor(): string {
    if (this.utilizationPercentage > 100) return 'danger';
    if (this.utilizationPercentage > 80) return 'warning';
    return 'success';
  }
}
