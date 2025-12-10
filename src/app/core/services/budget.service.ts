import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, combineLatest } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { Budget, TransactionCategory, Transaction } from '../models';
import { AuthService } from './auth.service';
import { TransactionService } from './transaction.service';

@Injectable({
  providedIn: 'root'
})
export class BudgetService {
  private apiUrl = 'http://localhost:3000';

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private transactionService: TransactionService
  ) {}

  getAll(): Observable<Budget[]> {
    const companyId = this.authService.getCurrentCompanyId();
    if (!companyId) {
      return new Observable(observer => {
        observer.next([]);
        observer.complete();
      });
    }
    return combineLatest([
      this.http.get<Budget[]>(`${this.apiUrl}/budgets`),
      this.transactionService.getAll()
    ]).pipe(
      map(([budgets, transactions]) => {
        const filtered = budgets.filter(b => b.companyId === companyId);
        return filtered.map(budget => this.enrichBudgetWithSpentData(budget, transactions));
      })
    );
  }

  getById(id: string): Observable<Budget> {
    return combineLatest([
      this.http.get<Budget>(`${this.apiUrl}/budgets/${id}`),
      this.transactionService.getAll()
    ]).pipe(
      map(([budget, transactions]) => this.enrichBudgetWithSpentData(budget, transactions))
    );
  }

  getByCategory(category: TransactionCategory): Observable<Budget[]> {
    const companyId = this.authService.getCurrentCompanyId();
    return this.http.get<Budget[]>(
      `${this.apiUrl}/budgets`
    ).pipe(
      map(budgets => budgets.filter(b => b.companyId === companyId && b.category === category))
    );
  }

  create(budget: Omit<Budget, 'id'>): Observable<Budget> {
    const newBudget = {
      ...budget,
      id: this.generateId()
    };
    return this.http.post<Budget>(
      `${this.apiUrl}/budgets`,
      newBudget
    );
  }

  update(id: string, updates: Partial<Budget>): Observable<Budget> {
    return this.http.patch<Budget>(
      `${this.apiUrl}/budgets/${id}`,
      updates
    );
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(
      `${this.apiUrl}/budgets/${id}`
    );
  }

  isExceeded(id: string): Observable<boolean> {
    return this.getById(id).pipe(
      map(budget => budget.spent > budget.limit)
    );
  }

  getUtilizationPercentage(id: string): Observable<number> {
    return this.getById(id).pipe(
      map(budget => (budget.spent / budget.limit) * 100)
    );
  }

  private enrichBudgetWithSpentData(budget: Budget, transactions: Transaction[]): Budget {
    const spent = transactions
      .filter(tx => 
        tx.type === 'expense' && 
        tx.category === budget.category &&
        tx.subcategory === budget.subcategory &&
        tx.walletId === budget.walletId &&
        tx.companyId === budget.companyId &&
        tx.date.toString().startsWith(budget.month)
      )
      .reduce((sum, tx) => sum + tx.amount, 0);
    
    return {
      ...budget,
      spent
    };
  }

  private generateId(): string {
    return 'bgt_' + Math.random().toString(36).substr(2, 9);
  }
}
