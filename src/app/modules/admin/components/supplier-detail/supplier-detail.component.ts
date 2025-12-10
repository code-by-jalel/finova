import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Supplier } from '../../../../core/models';
import { SupplierService } from '../../../../core/services';

@Component({
  selector: 'app-supplier-detail',
  templateUrl: './supplier-detail.component.html',
  styleUrls: ['./supplier-detail.component.css']
})
export class SupplierDetailComponent implements OnInit, OnDestroy {
  supplier: Supplier | null = null;
  loading = true;
  private destroy$ = new Subject<void>();

  constructor(
    private supplierService: SupplierService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.route.params
      .pipe(takeUntil(this.destroy$))
      .subscribe(params => {
        const id = params['id'];
        this.supplierService.getById(id)
          .pipe(takeUntil(this.destroy$))
          .subscribe({
            next: (supplier) => {
              this.supplier = supplier;
              this.loading = false;
            },
            error: (err) => {
              console.error('Erreur lors du chargement du fournisseur', err);
              this.loading = false;
            }
          });
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  edit(): void {
    if (this.supplier) {
      this.router.navigate(['/admin/suppliers', this.supplier.id, 'edit']);
    }
  }

  delete(): void {
    if (this.supplier && confirm('Êtes-vous sûr de vouloir supprimer ce fournisseur?')) {
      this.supplierService.delete(this.supplier.id)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.router.navigate(['/admin/suppliers']);
          },
          error: (err) => {
            console.error('Erreur lors de la suppression', err);
          }
        });
    }
  }

  back(): void {
    this.router.navigate(['/admin/suppliers']);
  }
}
