import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { SupplierService } from '../../../../core/services';

@Component({
  selector: 'app-supplier-form',
  templateUrl: './supplier-form.component.html',
  styleUrls: ['./supplier-form.component.css']
})
export class SupplierFormComponent implements OnInit, OnDestroy {
  supplierForm!: FormGroup;
  isEditMode = false;
  supplierId: string | null = null;
  submitted = false;
  loading = false;
  private destroy$ = new Subject<void>();

  constructor(
    private formBuilder: FormBuilder,
    private supplierService: SupplierService,
    private route: ActivatedRoute,
    public router: Router
  ) {}

  ngOnInit(): void {
    this.supplierForm = this.formBuilder.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', Validators.required],
      address: ['', Validators.required],
      city: ['', Validators.required],
      postalCode: ['', Validators.required],
      country: ['France', Validators.required],
      companyNumber: ['']
    });

    this.route.params
      .pipe(takeUntil(this.destroy$))
      .subscribe(params => {
        if (params['id']) {
          this.isEditMode = true;
          this.supplierId = params['id'];
          this.loadSupplier(params['id']);
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadSupplier(id: string): void {
    this.supplierService.getById(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (supplier) => {
          this.supplierForm.patchValue(supplier);
        },
        error: (err) => {
          console.error('Erreur lors du chargement du fournisseur', err);
        }
      });
  }

  get f() {
    return this.supplierForm.controls;
  }

  onSubmit(): void {
    this.submitted = true;

    if (this.supplierForm.invalid) {
      return;
    }

    this.loading = true;
    const formValue = this.supplierForm.value;

    if (this.isEditMode && this.supplierId) {
      this.supplierService.update(this.supplierId, formValue)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.router.navigate(['/admin/suppliers']);
          },
          error: (err) => {
            console.error('Erreur lors de la mise à jour', err);
            this.loading = false;
          }
        });
    } else {
      this.supplierService.create(formValue)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.router.navigate(['/admin/suppliers']);
          },
          error: (err) => {
            console.error('Erreur lors de la création', err);
            this.loading = false;
          }
        });
    }
  }
}
