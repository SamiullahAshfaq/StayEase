import { Routes } from '@angular/router';
import { AuthGuard } from './core/auth/auth.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./features/home/home.component').then(m => m.HomeComponent),
  },
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'register',
    loadComponent: () => import('./features/auth/register/register.component').then(m => m.RegisterComponent)
  },
  {
    path: 'listings',
    loadComponent: () => import('./features/listing/listing-search/listing-search.component').then(m => m.ListingSearchComponent)
  },
  {
    path: 'listings/:id',
    loadComponent: () => import('./features/listing/listing-detail/listing-detail.component').then(m => m.ListingDetailComponent)
  },
  {
    path: 'create-listing',
    loadComponent: () => import('./features/listing/listing-create/listing-create.component').then(m => m.ListingCreateComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'my-listings',
    loadComponent: () => import('./features/profile/my-listings/my-listings.component').then(m => m.MyListingsComponent),
    canActivate: [AuthGuard]
  },
  {
    path: '**',
    redirectTo: 'listings'
  }
];