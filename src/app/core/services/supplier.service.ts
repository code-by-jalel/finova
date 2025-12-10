import { Injectable, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, Subject } from 'rxjs';
import { Supplier } from '../models';
import { AuthService } from './auth.service';
import { takeUntil } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class SupplierService implements OnDestroy {
  private apiUrl = 'http://localhost:3000';
  private suppliersSubject = new BehaviorSubject<Supplier[]>([]);
  public suppliers$ = this.suppliersSubject.asObservable();
  private destroy$ = new Subject<void>();

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {
    this.loadSuppliers();
    this.authService.currentCompany$
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.loadSuppliers();
      });
  }

  private loadSuppliers(): void {
    const companyId = this.authService.getCurrentCompanyId();
    if (companyId) {
      this.http.get<Supplier[]>(`${this.apiUrl}/suppliers`)
        .subscribe(suppliers => {
          const filteredSuppliers = suppliers.filter(s => s.companyId === companyId);
          this.suppliersSubject.next(filteredSuppliers);
        });
    }
  }

  getAll(): Observable<Supplier[]> {
    const currentValue = this.suppliersSubject.getValue();
    if (currentValue.length === 0 && this.authService.getCurrentCompanyId()) {
      this.loadSuppliers();
    }
    return this.suppliers$;
  }

  getById(id: string): Observable<Supplier> {
    return this.http.get<Supplier>(
      `${this.apiUrl}/suppliers/${id}`
    );
  }

  create(supplier: Omit<Supplier, 'id' | 'companyId'>): Observable<Supplier> {
    const companyId = this.authService.getCurrentCompanyId();
    const newSupplier = {
      ...supplier,
      companyId: companyId || '',
      id: this.generateId()
    };
    return this.http.post<Supplier>(
      `${this.apiUrl}/suppliers`,
      newSupplier
    );
  }

  update(id: string, updates: Partial<Supplier>): Observable<Supplier> {
    return this.http.patch<Supplier>(
      `${this.apiUrl}/suppliers/${id}`,
      updates
    );
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(
      `${this.apiUrl}/suppliers/${id}`
    );
  }

  search(query: string): Observable<Supplier[]> {
    const companyId = this.authService.getCurrentCompanyId();
    return this.http.get<Supplier[]>(
      `${this.apiUrl}/suppliers?companyId=${companyId}&q=${query}`
    );
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private generateId(): string {
    return 'sup_' + Math.random().toString(36).substr(2, 9);
  }
}
