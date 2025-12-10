import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { BudgetService, AuthService } from '../../../../core/services';

@Component({
  selector: 'app-budget-form',
  templateUrl: './budget-form.component.html',
  styleUrls: ['./budget-form.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BudgetFormComponent implements OnInit, OnDestroy {
  budgetForm!: FormGroup;
  isEditMode = false;
  budgetId: string | null = null;
  submitted = false;
  loading = false;
  categories = ['Salaire', 'Abonnements', 'Achats', 'Transport', 'Maintenance', 'Autre'];
  private destroy$ = new Subject<void>();

  constructor(
    private formBuilder: FormBuilder,
    private budgetService: BudgetService,
    private authService: AuthService,
    private route: ActivatedRoute,
    public router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    const now = new Date();
    const currentMonth = now.toISOString().substring(0, 7);

    this.budgetForm = this.formBuilder.group({
      category: ['Achats', Validators.required],
      limit: ['', [Validators.required, Validators.min(0.01)]],
      month: [currentMonth, Validators.required]
    });

    this.route.params
      .pipe(takeUntil(this.destroy$))
      .subscribe(params => {
        if (params['id']) {
          this.isEditMode = true;
          this.budgetId = params['id'];
          this.loadBudget(params['id']);
        }
        this.cdr.markForCheck();
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadBudget(id: string): void {
    this.budgetService.getById(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (budget) => {
          this.budgetForm.patchValue({
            category: budget.category,
            limit: budget.limit,
            month: budget.month
          });
          this.cdr.markForCheck();
        },
        error: (err) => {
          console.error('Erreur lors du chargement du budget', err);
          this.cdr.markForCheck();
        }
      });
  }

  get f() {
    return this.budgetForm.controls;
  }

  onSubmit(): void {
    this.submitted = true;

    if (this.budgetForm.invalid) {
      return;
    }

    this.loading = true;
    const formValue = this.budgetForm.value;

    if (this.isEditMode && this.budgetId) {
      this.budgetService.update(this.budgetId, {
        category: formValue.category,
        limit: parseFloat(formValue.limit),
        month: formValue.month
      })
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.router.navigate(['/budgets']);
          },
          error: (err) => {
            console.error('Erreur lors de la mise à jour', err);
            this.loading = false;
            this.cdr.markForCheck();
          }
        });
    } else {
      const companyId = this.authService.getCurrentCompanyId();
      this.budgetService.create({
        companyId: companyId || '',
        walletId: 'wallet_1',
        department: 'General',
        category: formValue.category,
        subcategory: 'other',
        month: formValue.month,
        limit: parseFloat(formValue.limit),
        spent: 0,
        forecast: parseFloat(formValue.limit),
        status: 'healthy',
        notes: ''
      })
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.router.navigate(['/budgets']);
          },
          error: (err) => {
            console.error('Erreur lors de la création', err);
            this.loading = false;
            this.cdr.markForCheck();
          }
        });
    }
  }
}
