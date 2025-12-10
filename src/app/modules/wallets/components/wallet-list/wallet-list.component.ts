import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Wallet } from 'src/app/core/models';
import { WalletService } from 'src/app/core/services';

@Component({
  selector: 'app-wallet-list',
  templateUrl: './wallet-list.component.html',
  styleUrls: ['./wallet-list.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class WalletListComponent implements OnInit, OnDestroy {
  wallets: Wallet[] = [];
  loading = false;
  private destroy$ = new Subject<void>();

  constructor(
    private walletService: WalletService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadWallets();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadWallets(): void {
    this.loading = true;
    this.walletService.getAll()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (wallets) => {
          this.wallets = wallets;
          this.loading = false;
          this.cdr.markForCheck();
        },
        error: (err) => {
          console.error('Erreur lors du chargement des portefeuilles:', err);
          this.loading = false;
          this.cdr.markForCheck();
        }
      });
  }

  newWallet(): void {
    this.router.navigate(['/wallets/new']);
  }

  viewWallet(id: string): void {
    this.router.navigate(['/wallets', id]);
  }

  editWallet(id: string): void {
    this.router.navigate(['/wallets', id, 'edit']);
  }

  deleteWallet(id: string): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce portefeuille ?')) {
      this.walletService.delete(id)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.loadWallets();
          },
          error: (err) => console.error('Erreur:', err)
        });
    }
  }

  getTotalBalance(): number {
    return this.wallets.reduce((sum, wallet) => sum + wallet.balance, 0);
  }

  getTotalCreditLimit(): number {
    return this.wallets.reduce((sum, wallet) => sum + wallet.creditLimit, 0);
  }

  getAvailableFunds(): number {
    return this.wallets.reduce((sum, wallet) => sum + (wallet.balance + wallet.creditLimit), 0);
  }
}
