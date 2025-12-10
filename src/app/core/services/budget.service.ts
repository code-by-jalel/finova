import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin, of } from 'rxjs';
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

  // Récupère tous les budgets de l'entreprise
  getAll(): Observable<Budget[]> {
    const companyId = this.authService.getCurrentCompanyId();
    if (!companyId) {
      return new Observable(observer => {
        observer.next([]);
        observer.complete();
      });
    }
    return this.http.get<Budget[]>(
      `${this.apiUrl}/budgets`
    ).pipe(
      map(budgets => budgets.filter(b => b.companyId === companyId))
    );
  }

  getById(id: string): Observable<Budget> {
    return this.http.get<Budget>(
      `${this.apiUrl}/budgets/${id}`
    ).pipe(
      switchMap(budget => this.enrichBudgetWithSpent(budget))
    );
  }

  // Récupère les budgets par catégorie
  getByCategory(category: TransactionCategory): Observable<Budget[]> {
    const companyId = this.authService.getCurrentCompanyId();
    return this.http.get<Budget[]>(
      `${this.apiUrl}/budgets`
    ).pipe(
      map(budgets => budgets.filter(b => b.companyId === companyId && b.category === category))
    );
  }

  // Crée un nouveau budget
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

  // Modifie un budget
  update(id: string, updates: Partial<Budget>): Observable<Budget> {
    return this.http.patch<Budget>(
      `${this.apiUrl}/budgets/${id}`,
      updates
    );
  }

  // Supprime un budget
  delete(id: string): Observable<void> {
    return this.http.delete<void>(
      `${this.apiUrl}/budgets/${id}`
    );
  }

  // Vérifie si un budget est dépassé
  isExceeded(id: string): Observable<boolean> {
    return this.getById(id).pipe(
      map(budget => budget.spent > budget.limit)
    );
  }

  // Récupère le pourcentage d'utilisation
  getUtilizationPercentage(id: string): Observable<number> {
    return this.getById(id).pipe(
      map(budget => (budget.spent / budget.limit) * 100)
    );
  }

  // Enrichit un budget avec les dépenses calculées à partir des transactions
  private enrichBudgetWithSpent(budget: Budget): Observable<Budget> {
    return this.transactionService.getAll().pipe(
      map(transactions => {
        // Filtrer les transactions de type expense pour la catégorie et le mois du budget
        const spent = transactions
          .filter(tx => 
            tx.type === 'expense' && 
            tx.category === budget.category &&
            tx.date.toString().startsWith(budget.month)
          )
          .reduce((sum, tx) => sum + tx.amount, 0);
        
        return {
          ...budget,
          spent
        };
      })
    );
  }

  private generateId(): string {
    return 'bgt_' + Math.random().toString(36).substr(2, 9);
  }
}
