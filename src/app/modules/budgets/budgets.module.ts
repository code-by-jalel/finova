import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { BudgetsRoutingModule } from './budgets-routing.module';
import { BudgetListComponent } from './components/budget-list/budget-list.component';
import { BudgetFormComponent } from './components/budget-form/budget-form.component';
import { BudgetDetailComponent } from './components/budget-detail/budget-detail.component';

@NgModule({
  declarations: [BudgetListComponent, BudgetFormComponent, BudgetDetailComponent],
  imports: [CommonModule, ReactiveFormsModule, FormsModule, BudgetsRoutingModule]
})
export class BudgetsModule {}
