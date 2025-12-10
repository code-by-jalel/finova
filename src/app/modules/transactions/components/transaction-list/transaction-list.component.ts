import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Transaction } from '../../../../core/models';
import { TransactionService, AuthService } from '../../../../core/services';

@Component({
  selector: 'app-transaction-list',
  templateUrl: './transaction-list.component.html',
  styleUrls: ['./transaction-list.component.css']
})
export class TransactionListComponent implements OnInit, OnDestroy {
  Math = Math;
  transactions: Transaction[] = [];
  filteredTransactions: Transaction[] = [];
  searchQuery = '';
  filterStatus: 'all' | 'pending' | 'confirmed' | 'paid' | 'rejected' = 'all';
  filterType: 'all' | 'invoice' | 'expense' | 'transfer' | 'income' = 'all';
  startDate: string = '';
  endDate: string = '';
  currentPage = 1;
  pageSize = 10;
  totalItems = 0;
  loading = false;
  processingId: string | null = null;

  types: string[] = ['invoice', 'expense', 'transfer', 'income', 'adjustment'];
  statuses: string[] = ['pending', 'confirmed', 'paid', 'rejected', 'completed'];
  private destroy$ = new Subject<void>();

  constructor(
    private transactionService: TransactionService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadTransactions();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadTransactions(): void {
    this.loading = true;
    this.transactionService.getAll()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.transactions = data;
          this.applyFilters();
          this.loading = false;
        },
        error: (err) => {
          console.error('Erreur lors du chargement des transactions', err);
          this.loading = false;
        }
      });
  }

  applyFilters(): void {
    let filtered = this.transactions;

    if (this.searchQuery) {
      filtered = filtered.filter(t =>
        t.description.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        t.invoiceNumber?.toLowerCase().includes(this.searchQuery.toLowerCase())
      );
    }

    if (this.filterType !== 'all') {
      filtered = filtered.filter(t => t.type === this.filterType);
    }

    if (this.filterStatus !== 'all') {
      filtered = filtered.filter(t => t.status === this.filterStatus);
    }

    if (this.startDate) {
      filtered = filtered.filter(t => new Date(t.date) >= new Date(this.startDate));
    }
    if (this.endDate) {
      filtered = filtered.filter(t => new Date(t.date) <= new Date(this.endDate));
    }

    this.totalItems = filtered.length;
    this.filteredTransactions = filtered.slice(
      (this.currentPage - 1) * this.pageSize,
      this.currentPage * this.pageSize
    );
  }

  onSearch(): void {
    this.currentPage = 1;
    this.applyFilters();
  }

  onFilterChange(): void {
    this.currentPage = 1;
    this.applyFilters();
  }

  editTransaction(id: string): void {
    this.router.navigate(['/transactions', id, 'edit']);
  }

  viewTransaction(id: string): void {
    this.router.navigate(['/transactions', id]);
  }

  deleteTransaction(id: string): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette transaction?')) {
      this.transactionService.delete(id)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.loadTransactions();
          },
          error: (err) => {
            console.error('Erreur lors de la suppression', err);
          }
        });
    }
  }

  newTransaction(): void {
    this.router.navigate(['/transactions/new']);
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.applyFilters();
    }
  }

  nextPage(): void {
    if (this.currentPage < Math.ceil(this.totalItems / this.pageSize)) {
      this.currentPage++;
      this.applyFilters();
    }
  }

  getTypeLabel(type: string): string {
    const labels: { [key: string]: string } = {
      'income': 'Revenu',
      'expense': 'Dépense',
      'invoice': 'Facture',
      'transfer': 'Transfert',
      'adjustment': 'Ajustement'
    };
    return labels[type] || type;
  }

  getTypeClass(type: string): string {
    const classes: { [key: string]: string } = {
      'income': 'badge-success',
      'invoice': 'badge-info',
      'expense': 'badge-danger',
      'transfer': 'badge-warning',
      'adjustment': 'badge-secondary'
    };
    return classes[type] || 'badge-secondary';
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

  canApprove(transaction: Transaction): boolean {
    return transaction.status === 'pending' && this.authService.hasPermission('approve_transactions');
  }

  canReject(transaction: Transaction): boolean {
    return transaction.status === 'pending' && this.authService.hasPermission('approve_transactions');
  }

  canMarkAsPaid(transaction: Transaction): boolean {
    return transaction.status === 'confirmed' && (this.authService.isTreasurer() || this.authService.isCompanyAdmin());
  }

  approveTransaction(transaction: Transaction): void {
    if (!confirm(`Approuver la transaction de ${transaction.amount} د.ت?`)) return;
    
    this.processingId = transaction.id;
    const userId = this.authService.getCurrentUser()?.id || '1';
    this.transactionService.approve(transaction.id, userId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.processingId = null;
          this.loadTransactions();
        },
        error: (err) => {
          console.error('Erreur lors de l\'approbation', err);
          this.processingId = null;
          alert('Erreur lors de l\'approbation');
        }
      });
  }

  rejectTransaction(transaction: Transaction): void {
    if (!confirm(`Rejeter la transaction de ${transaction.amount} د.ت?`)) return;
    
    this.processingId = transaction.id;
    this.transactionService.reject(transaction.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.processingId = null;
          this.loadTransactions();
        },
        error: (err) => {
          console.error('Erreur lors du rejet', err);
          this.processingId = null;
          alert('Erreur lors du rejet');
        }
      });
  }

  markAsPaid(transaction: Transaction): void {
    if (!confirm(`Marquer la transaction de ${transaction.amount} د.ت comme payée?`)) return;
    
    this.processingId = transaction.id;
    this.transactionService.markAsPaid(transaction.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.processingId = null;
          this.loadTransactions();
        },
        error: (err) => {
          console.error('Erreur lors du paiement', err);
          this.processingId = null;
          alert('Erreur lors du paiement');
        }
      });
  }
}
