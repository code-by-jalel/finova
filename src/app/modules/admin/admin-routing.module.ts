import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SupplierListComponent } from './components/supplier-list/supplier-list.component';
import { SupplierFormComponent } from './components/supplier-form/supplier-form.component';
import { SupplierDetailComponent } from './components/supplier-detail/supplier-detail.component';
import { ReportsComponent } from './components/reports/reports.component';
import { UserManagementComponent } from './components/user-management/user-management.component';
import { AdminGuard } from '../../core/guards/admin.guard';

const routes: Routes = [
  {
    path: 'suppliers',
    component: SupplierListComponent,
    canActivate: [AdminGuard]
  },
  {
    path: 'suppliers/new',
    component: SupplierFormComponent,
    canActivate: [AdminGuard]
  },
  {
    path: 'suppliers/:id',
    component: SupplierDetailComponent,
    canActivate: [AdminGuard]
  },
  {
    path: 'suppliers/:id/edit',
    component: SupplierFormComponent,
    canActivate: [AdminGuard]
  },
  {
    path: 'reports',
    component: ReportsComponent,
    canActivate: [AdminGuard]
  },
  {
    path: 'users',
    component: UserManagementComponent,
    canActivate: [AdminGuard]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminRoutingModule {}
