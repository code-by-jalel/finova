import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { WalletsRoutingModule } from './wallets-routing.module';
import { WalletListComponent } from './components/wallet-list/wallet-list.component';
import { WalletDetailComponent } from './components/wallet-detail/wallet-detail.component';
import { WalletFormComponent } from './components/wallet-form/wallet-form.component';

@NgModule({
  declarations: [
    WalletListComponent,
    WalletDetailComponent,
    WalletFormComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    WalletsRoutingModule
  ]
})
export class WalletsModule { }

