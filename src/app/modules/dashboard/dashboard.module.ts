import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgChartsModule } from 'ng2-charts';
import { DashboardRoutingModule } from './dashboard-routing.module';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { AlertsDashboardComponent } from './components/alerts-dashboard/alerts-dashboard.component';

@NgModule({
  declarations: [DashboardComponent, AlertsDashboardComponent],
  imports: [CommonModule, FormsModule, NgChartsModule, DashboardRoutingModule]
})
export class DashboardModule {}
