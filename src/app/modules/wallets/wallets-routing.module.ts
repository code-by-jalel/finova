import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { WalletListComponent } from './components/wallet-list/wallet-list.component';
import { WalletDetailComponent } from './components/wallet-detail/wallet-detail.component';
import { WalletFormComponent } from './components/wallet-form/wallet-form.component';

const routes: Routes = [
  {
    path: '',
    component: WalletListComponent
  },
  {
    path: 'new',
    component: WalletFormComponent
  },
  {
    path: ':id',
    component: WalletDetailComponent
  },
  {
    path: ':id/edit',
    component: WalletFormComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class WalletsRoutingModule { }

