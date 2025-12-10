import { Injectable } from '@angular/core';
import { Observable, combineLatest, map } from 'rxjs';
import { DashboardData, Alert } from '../models';
import { TransactionService } from './transaction.service';
import { BudgetService } from './budget.service';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  constructor(
    private transactionService: TransactionService,
    private budgetService: BudgetService,
    private authService: AuthService
  ) {}

  getDashboardData(): Observable<DashboardData> {
    const currentCompanyId = this.authService.getCurrentCompanyId();
    
    return combineLatest([
      this.transactionService.getAll(),
      this.budgetService.getAll()
    ]).pipe(
      map(([transactions, budgets]) => {
        const companyTransactions = transactions.filter(t => t.companyId === currentCompanyId);
        
        const totalIncome = companyTransactions
          .filter(t => (t.type === 'income' && t.status === 'paid') || (t.type === 'invoice' && t.status === 'paid'))
          .reduce((sum, t) => sum + t.amount, 0);

        const totalExpenses = companyTransactions
          .filter(t => t.type === 'expense')
          .reduce((sum, t) => sum + t.amount, 0);

        const totalBalance = totalIncome - totalExpenses;

        const monthlyExpenses = this.getMonthlyExpenses(companyTransactions);
        const expensesByCategory = this.getExpensesByCategory(companyTransactions);
        const monthlyIncome = this.getMonthlyIncome(companyTransactions);

        const growthPercentage = this.calculateGrowthPercentage(monthlyIncome);
        const companyBudgets = budgets.filter(b => b.companyId === currentCompanyId);
        const alerts = this.generateAlerts(companyBudgets, companyTransactions);

        return {
          totalBalance,
          totalIncome,
          totalExpenses,
          monthlyExpenses,
          expensesByCategory,
          monthlyIncome,
          growthPercentage,
          pendingApprovals: companyTransactions.filter(t => t.status === 'pending').length,
          overdueBudgets: companyBudgets.filter(b => b.status === 'exceeded').length,
          walletsSummary: [],
          topExpenses: companyTransactions.filter(t => t.type === 'expense').slice(0, 5),
          upcomingPayments: companyTransactions.filter(t => t.type === 'invoice' && t.status !== 'paid').slice(0, 5),
          alerts
        };
      })
    );
  }

  private getMonthlyExpenses(transactions: any[]): { month: string; amount: number }[] {
    const monthlyMap = new Map<string, number>();
    
    const expenseTransactions = transactions.filter(t => t.type === 'expense');

    expenseTransactions.forEach(t => {
      const month = t.date.substring(0, 7);
      monthlyMap.set(month, (monthlyMap.get(month) || 0) + t.amount);
    });

    const result = Array.from(monthlyMap.entries())
      .map(([month, amount]) => ({ month, amount }))
      .sort((a, b) => a.month.localeCompare(b.month));
    
    return result;
  }

  private getMonthlyIncome(transactions: any[]): { month: string; amount: number }[] {
    const monthlyMap = new Map<string, number>();

    transactions
      .filter(t => (t.type === 'income' && t.status === 'paid') || (t.type === 'invoice' && t.status === 'paid'))
      .forEach(t => {
        const month = t.date.substring(0, 7);
        monthlyMap.set(month, (monthlyMap.get(month) || 0) + t.amount);
      });

    return Array.from(monthlyMap.entries())
      .map(([month, amount]) => ({ month, amount }))
      .sort((a, b) => a.month.localeCompare(b.month));
  }

  private getExpensesByCategory(transactions: any[]): { category: string; amount: number }[] {
    const categoryMap = new Map<string, number>();

    transactions
      .filter(t => t.type === 'expense')
      .forEach(t => {
        const current = categoryMap.get(t.category) || 0;
        categoryMap.set(t.category, current + t.amount);
      });

    return Array.from(categoryMap.entries())
      .map(([category, amount]) => ({ category, amount }))
      .sort((a, b) => b.amount - a.amount);
  }

  private calculateGrowthPercentage(monthlyIncome: { month: string; amount: number }[]): number {
    if (monthlyIncome.length < 2) return 0;

    const lastMonth = monthlyIncome[monthlyIncome.length - 1].amount;
    const previousMonth = monthlyIncome[monthlyIncome.length - 2].amount;

    if (previousMonth === 0) return 0;
    return ((lastMonth - previousMonth) / previousMonth) * 100;
  }

  private getBiggestExpenseMonth(monthlyExpenses: { month: string; amount: number }[]): string {
    if (monthlyExpenses.length === 0) return 'N/A';

    const max = monthlyExpenses.reduce((prev, current) =>
      prev.amount > current.amount ? prev : current
    );
    return max.month;
  }

  private generateAlerts(budgets: any[], transactions: any[]): Alert[] {
    const alerts: Alert[] = [];
    const now = new Date().toISOString();
    const currentMonth = new Date().toISOString().substring(0, 7);

    budgets.forEach(budget => {
      if (budget.month === currentMonth && budget.spent > budget.limit) {
        alerts.push({
          id: `alert-${budget.id}`,
          companyId: budget.companyId,
          type: 'budget_warning',
          severity: 'danger',
          title: 'Budget dépassé',
          message: `Budget "${budget.category}" dépassé : ${budget.spent} د.ت / ${budget.limit} د.ت`,
          createdAt: now,
          read: false
        });
      } else if (budget.month === currentMonth && budget.spent > budget.limit * 0.8) {
        alerts.push({
          id: `alert-warn-${budget.id}`,
          companyId: budget.companyId,
          type: 'budget_warning',
          severity: 'warning',
          title: 'Budget alerte',
          message: `Budget "${budget.category}" presque dépassé : ${budget.spent} د.ت / ${budget.limit} د.ت`,
          createdAt: now,
          read: false
        });
      }
    });

    const avgExpense = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0) / Math.max(transactions.length, 1);

    transactions
      .filter(t => t.type === 'expense')
      .slice(-5)
      .forEach(t => {
        if (t.amount > avgExpense * 2) {
          alerts.push({
            id: `alert-unusual-${t.id}`,
            companyId: t.companyId,
            type: 'invoice_overdue',
            severity: 'info',
            title: 'Dépense inhabituelle',
            message: `Dépense inhabituelle : ${t.description} (${t.amount} د.ت)`,
            transactionId: t.id,
            createdAt: now,
            read: false
          });
        }
      });

    return alerts;
  }
}
