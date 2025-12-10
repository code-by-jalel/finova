import { Injectable, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, Subject } from 'rxjs';
import { tap, map, switchMap, takeUntil } from 'rxjs/operators';
import { Transaction, TransactionType, TransactionStatus } from '../models';
import { AuthService } from './auth.service';
import { WalletService } from './wallet.service';

@Injectable({
  providedIn: 'root'
})
export class TransactionService implements OnDestroy {
  private apiUrl = 'http://localhost:3000';
  private transactionsSubject = new BehaviorSubject<Transaction[]>([]);
  public transactions$ = this.transactionsSubject.asObservable();
  private destroy$ = new Subject<void>();

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private walletService: WalletService
  ) {
    this.loadTransactions();
    this.authService.currentCompany$
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.loadTransactions();
      });
  }

  private loadTransactions(): void {
    const companyId = this.authService.getCurrentCompanyId();
    if (companyId) {
      this.http.get<Transaction[]>(`${this.apiUrl}/transactions`)
        .subscribe(transactions => {
          const filteredTransactions = transactions.filter(tx => tx.companyId === companyId);
          this.transactionsSubject.next(filteredTransactions);
        });
    }
  }

  getAll(): Observable<Transaction[]> {
    const currentValue = this.transactionsSubject.getValue();
    if (currentValue.length === 0 && this.authService.getCurrentCompanyId()) {
      this.loadTransactions();
    }
    return this.transactions$;
  }

  getByWallet(walletId: string): Observable<Transaction[]> {
    return this.transactions$.pipe(
      map(transactions => transactions.filter(tx => tx.walletId === walletId))
    );
  }

  getById(id: string): Observable<Transaction> {
    return this.http.get<Transaction>(
      `${this.apiUrl}/transactions/${id}`
    );
  }

  create(transaction: Omit<Transaction, 'id' | 'companyId' | 'createdBy'>): Observable<Transaction> {
    const companyId = this.authService.getCurrentCompanyId();
    const user = this.authService.getCurrentUser();
    
    const newTx: Transaction = {
      ...transaction,
      id: this.generateId(),
      companyId: companyId || '',
      createdBy: user?.id || '',
      date: new Date(transaction.date).toISOString().split('T')[0]
    };

    return this.http.post<Transaction>(`${this.apiUrl}/transactions`, newTx)
      .pipe(
        switchMap(tx => {
          const amount = tx.type === 'income' || tx.type === 'invoice' ? tx.amount : -tx.amount;
          return this.walletService.updateBalance(tx.walletId, amount).pipe(
            map(() => tx)
          );
        })
      );
  }

  update(id: string, updates: Partial<Transaction>): Observable<Transaction> {
    return this.http.patch<Transaction>(
      `${this.apiUrl}/transactions/${id}`,
      updates
    );
  }

  approve(id: string, approverId: string): Observable<Transaction> {
    return this.update(id, { 
      approvedBy: approverId,
      status: 'confirmed'
    });
  }

  reject(id: string): Observable<Transaction> {
    return this.update(id, { 
      status: 'rejected'
    });
  }

  markAsPaid(id: string): Observable<Transaction> {
    return this.update(id, { 
      status: 'paid',
      paidDate: new Date().toISOString().split('T')[0]
    });
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(
      `${this.apiUrl}/transactions/${id}`
    );
  }

  search(query: string): Observable<Transaction[]> {
    return this.transactions$.pipe(
      map(transactions => 
        transactions.filter(tx => 
          tx.description.toLowerCase().includes(query.toLowerCase()) ||
          tx.invoiceNumber?.toLowerCase().includes(query.toLowerCase())
        )
      )
    );
  }

  filterByType(type: TransactionType): Observable<Transaction[]> {
    return this.transactions$.pipe(
      map(transactions => transactions.filter(tx => tx.type === type))
    );
  }

  filterByStatus(status: TransactionStatus): Observable<Transaction[]> {
    return this.transactions$.pipe(
      map(transactions => transactions.filter(tx => tx.status === status))
    );
  }

  filterByCategory(category: string): Observable<Transaction[]> {
    return this.transactions$.pipe(
      map(transactions => transactions.filter(tx => tx.category === category))
    );
  }

  filterByDateRange(startDate: string, endDate: string): Observable<Transaction[]> {
    return this.transactions$.pipe(
      map(transactions => 
        transactions.filter(tx => tx.date >= startDate && tx.date <= endDate)
      )
    );
  }

  getPendingApprovals(): Observable<Transaction[]> {
    return this.transactions$.pipe(
      map(transactions => 
        transactions.filter(tx => tx.status === 'pending' && !tx.approvedBy)
      )
    );
  }

  getOverdueInvoices(): Observable<Transaction[]> {
    const today = new Date().toISOString().split('T')[0];
    return this.transactions$.pipe(
      map(transactions => 
        transactions.filter(tx => 
          tx.type === 'invoice' && 
          tx.status !== 'paid' && 
          tx.dueDate && 
          tx.dueDate < today
        )
      )
    );
  }

  getByClient(clientId: string): Observable<Transaction[]> {
    return this.transactions$.pipe(
      map(transactions => 
        transactions.filter(tx => tx.relatedEntity === clientId)
      )
    );
  }

  getBySupplier(supplierId: string): Observable<Transaction[]> {
    return this.transactions$.pipe(
      map(transactions => 
        transactions.filter(tx => tx.relatedEntity === supplierId)
      )
    );
  }

  getTotalIncome(startDate: string, endDate: string): Observable<number> {
    return this.filterByDateRange(startDate, endDate).pipe(
      map(transactions => 
        transactions
          .filter(tx => (tx.type === 'income' || tx.type === 'invoice') && tx.status === 'paid')
          .reduce((sum, tx) => sum + tx.amount, 0)
      )
    );
  }

  getTotalExpenses(startDate: string, endDate: string): Observable<number> {
    return this.filterByDateRange(startDate, endDate).pipe(
      map(transactions => 
        transactions
          .filter(tx => (tx.type === 'expense') && tx.status === 'paid')
          .reduce((sum, tx) => sum + tx.amount, 0)
      )
    );
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private generateId(): string {
    return 'tx_' + Math.random().toString(36).substr(2, 9);
  }
}
