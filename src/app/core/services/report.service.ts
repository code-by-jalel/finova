import { Injectable } from '@angular/core';
import { Transaction, Budget } from '../models';

@Injectable({
  providedIn: 'root'
})
export class ReportService {

  constructor() {}
  generateTransactionCSV(transactions: Transaction[]): void {
    const csv = this.transactionsToCSV(transactions);
    this.downloadFile(csv, 'transactions-report.csv', 'text/csv');
  }

  /**
   * Generate a CSV report for budgets
   */
  generateBudgetCSV(budgets: Budget[]): void {
    const csv = this.budgetsToCSV(budgets);
    this.downloadFile(csv, 'budgets-report.csv', 'text/csv');
  }

  /**
   * Generate a combined financial summary PDF
   */
  generateFinancialSummaryPDF(
    totalBalance: number,
    totalIncome: number,
    totalExpenses: number,
    transactions: Transaction[],
    budgets: Budget[]
  ): void {
    const pdfContent = this.generatePDFContent(
      totalBalance,
      totalIncome,
      totalExpenses,
      transactions,
      budgets
    );
    this.downloadFile(pdfContent, 'financial-summary.txt', 'text/plain');
  }

  /**
   * Convert transactions to CSV format
   */
  private transactionsToCSV(transactions: Transaction[]): string {
    const headers = ['Date', 'Description', 'Type', 'Status', 'Amount', 'Category', 'Invoice', 'DueDate'];
    const rows = transactions.map(t => [
      new Date(t.date).toLocaleDateString('fr-FR'),
      t.description,
      t.type,
      t.status,
      t.amount.toString(),
      t.category,
      t.invoiceNumber || '',
      t.dueDate ? new Date(t.dueDate).toLocaleDateString('fr-FR') : ''
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    return csvContent;
  }

  /**
   * Convert budgets to CSV format
   */
  private budgetsToCSV(budgets: Budget[]): string {
    const headers = ['Department', 'Category', 'Month', 'Limit', 'Spent', 'Forecast', 'Status'];
    const rows = budgets.map(b => [
      b.department,
      b.category,
      b.month,
      b.limit.toString(),
      b.spent.toString(),
      b.forecast.toString(),
      b.status
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    return csvContent;
  }

  /**
   * Generate PDF-like content (as text)
   */
  private generatePDFContent(
    totalBalance: number,
    totalIncome: number,
    totalExpenses: number,
    transactions: Transaction[],
    budgets: Budget[]
  ): string {
    const date = new Date().toLocaleDateString('fr-FR');
    const pendingTransactions = transactions.filter(t => t.status === 'pending').length;
    const confirmedTransactions = transactions.filter(t => t.status === 'confirmed').length;

    let content = `
================================================================================
                         RAPPORT FINANCIER
================================================================================
Date du rapport: ${date}

================================================================================
                        RÉSUMÉ FINANCIER
================================================================================
Solde total:                    ${totalBalance.toFixed(2)} د.ت
Revenus totaux:                 ${totalIncome.toFixed(2)} د.ت
Dépenses totales:               ${totalExpenses.toFixed(2)} د.ت
Profit/Perte:                   ${(totalIncome - totalExpenses).toFixed(2)} د.ت

================================================================================
                      ÉTAT DES TRANSACTIONS
================================================================================
Nombre total de transactions:   ${transactions.length}
Transactions en attente:        ${pendingTransactions}
Transactions confirmées:        ${confirmedTransactions}
Transactions payées:            ${transactions.filter(t => t.status === 'paid').length}

Dernières transactions:
`;

    // Add latest 10 transactions
    transactions.slice(0, 10).forEach((t, idx) => {
      content += `
${idx + 1}. ${t.date} - ${t.description}
   Montant: ${t.amount} د.ت | Type: ${t.type} | Statut: ${t.status}`;
    });

    content += `

================================================================================
                      ÉTAT DES BUDGETS
================================================================================
Nombre de budgets:              ${budgets.length}
Budgets sains:                  ${budgets.filter(b => b.status === 'healthy').length}
Budgets en alerte:              ${budgets.filter(b => b.status === 'warning').length}
Budgets dépassés:               ${budgets.filter(b => b.status === 'exceeded').length}

Dépenses budgétaires:
`;

    // Add budget summary
    budgets.forEach((b, idx) => {
      const percent = ((b.spent / b.limit) * 100).toFixed(1);
      content += `
${idx + 1}. ${b.department} - ${b.category}
   Limite: ${b.limit} د.ت | Dépensé: ${b.spent} د.ت (${percent}%) | Prévision: ${b.forecast} د.ت`;
    });

    content += `

================================================================================
                         FIN DU RAPPORT
================================================================================
Ce rapport a été généré automatiquement. Les données reflètent l'état au moment
de la génération.
================================================================================
`;

    return content;
  }

  /**
   * Download file helper
   */
  private downloadFile(content: string, filename: string, mimeType: string): void {
    const blob = new Blob([content], { type: mimeType });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    window.URL.revokeObjectURL(url);
  }

  /**
   * Export data to JSON
   */
  exportToJSON(data: any, filename: string): void {
    const json = JSON.stringify(data, null, 2);
    this.downloadFile(json, filename, 'application/json');
  }
}
