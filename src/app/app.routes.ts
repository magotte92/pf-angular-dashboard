import { Routes } from '@angular/router';
import { CryptoDashComponent } from '@pf-app/components';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'crypto-dashboard',
  },
  {
    path: 'crypto-dashboard',
    component: CryptoDashComponent,
  },
  {
    path: '**',
    redirectTo: 'crypto-dashboard',
  },
];
