import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Wallet, Transaction } from 'src/app/core/models';
import { WalletService, TransactionService } from 'src/app/core/services';

@Component({
  selector: 'app-wallet-detail',
  templateUrl: './wallet-detail.component.html',
  styleUrls: ['./wallet-detail.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class WalletDetailComponent implements OnInit, OnDestroy {
  wallet: Wallet | null = null;
  transactions: Transaction[] = [];
  loading = true;
  walletId: string | null = null;
  private destroy$ = new Subject<void>();

  constructor(
    private walletService: WalletService,
    private transactionService: TransactionService,
    private route: ActivatedRoute,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.walletId = this.route.snapshot.paramMap.get('id');
    if (this.walletId) {
      this.loadWallet(this.walletId);
      this.loadTransactions(this.walletId);
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadWallet(id: string): void {
    this.walletService.getById(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (wallet) => {
          this.wallet = wallet;
          this.loading = false;
          this.cdr.markForCheck();
        },
        error: (err) => {
          console.error('Erreur:', err);
          this.loading = false;
          this.cdr.markForCheck();
        }
      });
  }

  loadTransactions(walletId: string): void {
    this.transactionService.getAll()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (allTransactions) => {
          this.transactions = allTransactions.filter(t => t.walletId === walletId);
          this.transactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
          this.cdr.markForCheck();
        },
        error: (err) => {
          console.error('Erreur lors du chargement des transactions:', err);
          this.cdr.markForCheck();
        }
      });
  }

  edit(): void {
    if (this.wallet) {
      this.router.navigate(['/wallets', this.wallet.id, 'edit']);
    }
  }

  back(): void {
    this.router.navigate(['/wallets']);
  }

  getStatusClass(status: string): string {
    const classes: { [key: string]: string } = {
      'pending': 'badge-warning',
      'confirmed': 'badge-info',
      'paid': 'badge-success',
      'rejected': 'badge-danger',
      'completed': 'badge-success'
    };
    return classes[status] || 'badge-secondary';
  }

  getStatusLabel(status: string): string {
    const labels: { [key: string]: string } = {
      'pending': 'En attente',
      'confirmed': 'Confirmée',
      'paid': 'Payée',
      'rejected': 'Rejetée',
      'completed': 'Complétée'
    };
    return labels[status] || status;
  }
}
