import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Supplier } from '../../../../core/models';
import { SupplierService } from '../../../../core/services';

@Component({
  selector: 'app-supplier-list',
  templateUrl: './supplier-list.component.html',
  styleUrls: ['./supplier-list.component.css']
})
export class SupplierListComponent implements OnInit, OnDestroy {
  suppliers: Supplier[] = [];
  filteredSuppliers: Supplier[] = [];
  searchQuery = '';
  loading = false;
  private destroy$ = new Subject<void>();

  constructor(private supplierService: SupplierService, private router: Router) {}

  ngOnInit(): void {
    this.loadSuppliers();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadSuppliers(): void {
    this.loading = true;
    this.supplierService.getAll()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.suppliers = data;
          this.applyFilters();
          this.loading = false;
        },
        error: (err) => {
          console.error('Erreur lors du chargement des fournisseurs', err);
          this.loading = false;
        }
      });
  }

  applyFilters(): void {
    if (this.searchQuery) {
      this.filteredSuppliers = this.suppliers.filter(s =>
        s.name.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        s.email.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        s.city.toLowerCase().includes(this.searchQuery.toLowerCase())
      );
    } else {
      this.filteredSuppliers = this.suppliers;
    }
  }

  onSearch(): void {
    this.applyFilters();
  }

  newSupplier(): void {
    this.router.navigate(['/admin/suppliers/new']);
  }

  editSupplier(id: string): void {
    this.router.navigate(['/admin/suppliers', id, 'edit']);
  }

  viewSupplier(id: string): void {
    this.router.navigate(['/admin/suppliers', id]);
  }

  deleteSupplier(id: string): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce fournisseur?')) {
      this.supplierService.delete(id)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.loadSuppliers();
          },
          error: (err) => {
            console.error('Erreur lors de la suppression', err);
          }
        });
    }
  }
}
