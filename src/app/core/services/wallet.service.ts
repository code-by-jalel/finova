import { Injectable, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { map, tap, switchMap, takeUntil } from 'rxjs/operators';
import { Wallet, Transaction } from '../models';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class WalletService implements OnDestroy {
  private apiUrl = 'http://localhost:3000';
  private walletsSubject = new BehaviorSubject<Wallet[]>([]);
  public wallets$ = this.walletsSubject.asObservable();
  private destroy$ = new Subject<void>();

  constructor(private http: HttpClient, private authService: AuthService) {
    this.loadWallets();
    // S'abonner aux changements de compagnie pour recharger les portefeuilles
    this.authService.currentCompany$
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.loadWallets();
      });
  }

  loadWallets(): void {
    const companyId = this.authService.getCurrentCompanyId();
    if (companyId) {
      this.http.get<Wallet[]>(`${this.apiUrl}/wallets`)
        .subscribe(wallets => {
          const filteredWallets = wallets.filter(w => w.companyId === companyId);
          this.walletsSubject.next(filteredWallets);
        });
    }
  }

  getAll(): Observable<Wallet[]> {
    // Forcer le rechargement si les données sont vides et qu'on a une compagnie
    const currentValue = this.walletsSubject.getValue();
    if (currentValue.length === 0 && this.authService.getCurrentCompanyId()) {
      this.loadWallets();
    }
    return this.wallets$;
  }

  getById(id: string): Observable<Wallet> {
    return this.http.get<Wallet>(`${this.apiUrl}/wallets/${id}`);
  }

  create(wallet: Omit<Wallet, 'id' | 'createdAt'>): Observable<Wallet> {
    const companyId = this.authService.getCurrentCompanyId();
    const newWallet: Wallet = {
      ...wallet,
      id: this.generateWalletId(),
      companyId: companyId || '',
      createdAt: new Date().toISOString()
    };

    return this.http.post<Wallet>(`${this.apiUrl}/wallets`, newWallet)
      .pipe(
        tap(() => this.loadWallets())
      );
  }

  update(id: string, updates: Partial<Wallet>): Observable<Wallet> {
    return this.http.patch<Wallet>(`${this.apiUrl}/wallets/${id}`, updates)
      .pipe(
        tap(() => this.loadWallets())
      );
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/wallets/${id}`)
      .pipe(
        tap(() => this.loadWallets())
      );
  }

  getTotalBalance(): Observable<number> {
    return this.wallets$.pipe(
      map(wallets => wallets.reduce((sum, wallet) => sum + wallet.balance, 0))
    );
  }

  getWalletBalance(walletId: string): Observable<number> {
    return this.getById(walletId).pipe(
      map(wallet => wallet.balance)
    );
  }

  updateBalance(walletId: string, amount: number): Observable<Wallet> {
    return this.getById(walletId).pipe(
      switchMap(wallet => {
        const newBalance = wallet.balance + amount;
        return this.update(walletId, { balance: newBalance });
      })
    );
  }

  getWalletTransactions(walletId: string): Observable<Transaction[]> {
    return this.http.get<Transaction[]>(`${this.apiUrl}/transactions`).pipe(
      map(transactions => transactions.filter(t => t.walletId === walletId))
    );
  }

  canDebit(walletId: string, amount: number): Observable<boolean> {
    return this.getById(walletId).pipe(
      map(wallet => {
        const availableFunds = wallet.balance + wallet.creditLimit;
        return amount <= availableFunds;
      })
    );
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private generateWalletId(): string {
    return 'wallet_' + Math.random().toString(36).substr(2, 9);
  }
}
