import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Transaction } from '../../../../core/models';
import { TransactionService } from '../../../../core/services';

@Component({
  selector: 'app-transaction-detail',
  templateUrl: './transaction-detail.component.html',
  styleUrls: ['./transaction-detail.component.css']
})
export class TransactionDetailComponent implements OnInit, OnDestroy {
  transaction: Transaction | null = null;
  loading = true;
  private destroy$ = new Subject<void>();

  constructor(
    private transactionService: TransactionService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.route.params
      .pipe(takeUntil(this.destroy$))
      .subscribe(params => {
        const id = params['id'];
        this.transactionService.getById(id)
          .pipe(takeUntil(this.destroy$))
          .subscribe({
            next: (transaction) => {
              this.transaction = transaction;
              this.loading = false;
            },
            error: (err) => {
              console.error('Erreur lors du chargement de la transaction', err);
              this.loading = false;
            }
          });
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  edit(): void {
    if (this.transaction) {
      this.router.navigate(['/transactions', this.transaction.id, 'edit']);
    }
  }

  delete(): void {
    if (this.transaction && confirm('Êtes-vous sûr de vouloir supprimer cette transaction?')) {
      this.transactionService.delete(this.transaction.id)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.router.navigate(['/transactions']);
          },
          error: (err) => {
            console.error('Erreur lors de la suppression', err);
          }
        });
    }
  }

  back(): void {
    this.router.navigate(['/transactions']);
  }

  getTypeLabel(type: string): string {
    return type === 'income' ? 'Revenu' : 'Dépense';
  }

  getTypeClass(type: string): string {
    return type === 'income' ? 'badge-success' : 'badge-danger';
  }
}
