import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Transaction } from '../../../../core/models';
import { TransactionService, AuthService } from '../../../../core/services';

@Component({
  selector: 'app-transaction-form',
  templateUrl: './transaction-form.component.html',
  styleUrls: ['./transaction-form.component.css']
})
export class TransactionFormComponent implements OnInit, OnDestroy {
  transactionForm!: FormGroup;
  isEditMode = false;
  transactionId: string | null = null;
  submitted = false;
  loading = false;
  categories = ['Salaire', 'Abonnements', 'Achats', 'Transport', 'Maintenance', 'Autre'];
  private destroy$ = new Subject<void>();

  constructor(
    private formBuilder: FormBuilder,
    private transactionService: TransactionService,
    private authService: AuthService,
    private route: ActivatedRoute,
    public router: Router
  ) {}

  ngOnInit(): void {
    this.transactionForm = this.formBuilder.group({
      type: ['expense', Validators.required],
      category: ['Achats', Validators.required],
      amount: ['', [Validators.required, Validators.min(0.01)]],
      description: ['', [Validators.required, Validators.minLength(3)]],
      date: [new Date().toISOString().split('T')[0], Validators.required]
    });

    this.route.params
      .pipe(takeUntil(this.destroy$))
      .subscribe(params => {
        if (params['id']) {
          this.isEditMode = true;
          this.transactionId = params['id'];
          this.loadTransaction(params['id']);
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadTransaction(id: string): void {
    this.transactionService.getById(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (transaction) => {
          this.transactionForm.patchValue({
            type: transaction.type,
            category: transaction.category,
            amount: transaction.amount,
            description: transaction.description,
            date: new Date(transaction.date).toISOString().split('T')[0]
          });
        },
        error: (err) => {
          console.error('Erreur lors du chargement de la transaction', err);
        }
      });
  }

  get f() {
    return this.transactionForm.controls;
  }

  onSubmit(): void {
    this.submitted = true;

    if (this.transactionForm.invalid) {
      return;
    }

    this.loading = true;
    const formValue = this.transactionForm.value;
    const dateStr = typeof formValue.date === 'string' 
      ? formValue.date 
      : new Date(formValue.date).toISOString().split('T')[0];

    if (this.isEditMode && this.transactionId) {
      this.transactionService.update(this.transactionId, {
        type: formValue.type,
        category: formValue.category,
        amount: parseFloat(formValue.amount),
        description: formValue.description,
        date: dateStr
      })
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.router.navigate(['/transactions']);
          },
          error: (err) => {
            console.error('Erreur lors de la mise à jour', err);
            this.loading = false;
          }
        });
    } else {
      const companyId = this.authService.getCurrentCompanyId();
      this.transactionService.create({
        type: formValue.type,
        category: formValue.category,
        amount: parseFloat(formValue.amount),
        description: formValue.description,
        date: dateStr,
        walletId: 'wallet_1',
        currency: 'EUR',
        status: 'pending',
        subcategory: 'other',
        tags: []
      })
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.router.navigate(['/transactions']);
          },
          error: (err) => {
            console.error('Erreur lors de la création', err);
            this.loading = false;
          }
        });
    }
  }
}
