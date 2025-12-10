import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { TransactionsRoutingModule } from './transactions-routing.module';
import { TransactionListComponent } from './components/transaction-list/transaction-list.component';
import { TransactionFormComponent } from './components/transaction-form/transaction-form.component';
import { TransactionDetailComponent } from './components/transaction-detail/transaction-detail.component';

@NgModule({
  declarations: [
    TransactionListComponent,
    TransactionFormComponent,
    TransactionDetailComponent
  ],
  imports: [CommonModule, ReactiveFormsModule, FormsModule, TransactionsRoutingModule]
})
export class TransactionsModule {}
