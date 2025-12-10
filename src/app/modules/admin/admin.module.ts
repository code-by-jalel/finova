import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { AdminRoutingModule } from './admin-routing.module';
import { SupplierListComponent } from './components/supplier-list/supplier-list.component';
import { SupplierFormComponent } from './components/supplier-form/supplier-form.component';
import { SupplierDetailComponent } from './components/supplier-detail/supplier-detail.component';
import { AuditLogComponent } from './components/audit-log/audit-log.component';
import { ReportsComponent } from './components/reports/reports.component';
import { UserManagementComponent } from './components/user-management/user-management.component';

@NgModule({
  declarations: [
    SupplierListComponent,
    SupplierFormComponent,
    SupplierDetailComponent,
    AuditLogComponent,
    ReportsComponent,
    UserManagementComponent
  ],
  imports: [CommonModule, ReactiveFormsModule, FormsModule, AdminRoutingModule]
})
export class AdminModule {}
