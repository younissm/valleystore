import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./features/catalog/product-list.component').then(module => module.ProductListComponent),
  },
  {
    path: 'checkout',
    loadComponent: () => import('./features/checkout/checkout.component').then(module => module.CheckoutComponent),
  },
  {
    path: '**',
    redirectTo: '',
  },
];
