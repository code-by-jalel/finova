import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject, combineLatest } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Transaction, Budget } from '../../../../core/models';
import { TransactionService, BudgetService, DashboardService, ReportService } from '../../../../core/services';

@Component({
  selector: 'app-reports',
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.css']
})
export class ReportsComponent implements OnInit, OnDestroy {
  transactions: Transaction[] = [];
  budgets: Budget[] = [];
  dashboardData: any = null;

  loading = false;
  generatingReport: string | null = null;

  reportTypes = [
    { id: 'transactions_csv', label: 'Transactions (CSV)', icon: '📊' },
    { id: 'budgets_csv', label: 'Budgets (CSV)', icon: '💰' },
    { id: 'financial_summary', label: 'Résumé Financier (Texte)', icon: '📄' },
    { id: 'export_all', label: 'Exporter tout (JSON)', icon: '💾' }
  ];

  private destroy$ = new Subject<void>();

  constructor(
    private transactionService: TransactionService,
    private budgetService: BudgetService,
    private dashboardService: DashboardService,
    private reportService: ReportService
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadData(): void {
    this.loading = true;
    
    combineLatest([
      this.transactionService.getAll(),
      this.budgetService.getAll(),
      this.dashboardService.getDashboardData()
    ]).pipe(
      takeUntil(this.destroy$)
    ).subscribe((data: any) => {
      const [transactions, budgets, dashboard] = data;
      this.transactions = transactions;
      this.budgets = budgets;
      this.dashboardData = dashboard;
      this.loading = false;
    }, (err) => {
      console.error('Erreur lors du chargement des données:', err);
      this.loading = false;
      alert('Erreur lors du chargement des données');
    });
  }

  generateReport(reportType: string): void {
    this.generatingReport = reportType;

    try {
      switch (reportType) {
        case 'transactions_csv':
          this.reportService.generateTransactionCSV(this.transactions);
          break;
        
        case 'budgets_csv':
          this.reportService.generateBudgetCSV(this.budgets);
          break;
        
        case 'financial_summary':
          this.reportService.generateFinancialSummaryPDF(
            this.dashboardData?.totalBalance || 0,
            this.dashboardData?.totalIncome || 0,
            this.dashboardData?.totalExpenses || 0,
            this.transactions,
            this.budgets
          );
          break;
        
        case 'export_all':
          const allData = {
            exportedAt: new Date().toISOString(),
            summary: {
              totalTransactions: this.transactions.length,
              totalBudgets: this.budgets.length
            },
            transactions: this.transactions,
            budgets: this.budgets,
            dashboardData: this.dashboardData
          };
          this.reportService.exportToJSON(allData, 'export-complet.json');
          break;
      }
      
      this.generatingReport = null;
    } catch (error) {
      console.error('Erreur lors de la génération du rapport:', error);
      this.generatingReport = null;
      alert('Erreur lors de la génération du rapport');
    }
  }

  refreshData(): void {
    this.loadData();
  }

  getReportLabel(id: string): string {
    const report = this.reportTypes.find(r => r.id === id);
    return report ? report.label : id;
  }
}
