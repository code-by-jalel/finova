import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { BudgetListComponent } from './components/budget-list/budget-list.component';
import { BudgetFormComponent } from './components/budget-form/budget-form.component';
import { BudgetDetailComponent } from './components/budget-detail/budget-detail.component';

const routes: Routes = [
  {
    path: '',
    component: BudgetListComponent
  },
  {
    path: 'new',
    component: BudgetFormComponent
  },
  {
    path: ':id',
    component: BudgetDetailComponent
  },
  {
    path: ':id/edit',
    component: BudgetFormComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class BudgetsRoutingModule {}
