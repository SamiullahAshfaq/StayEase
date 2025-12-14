// src/app/app.routes.ts
import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { guestGuard } from './core/guards/guest.guard';
import { profileCompleteGuard } from './core/guards/profile-complete.guard';
import { roleGuard } from './core/guards/role.guard';

export const routes: Routes = [
  // Public routes
  {
    path: '',
    loadComponent: () => import('./features/home/home.component').then(m => m.HomeComponent),
    title: 'StayEase - Find Your Perfect Stay'
  },

  // Auth routes (only accessible when not logged in)
  {
    path: 'auth',
    canActivate: [guestGuard],
    children: [
      {
        path: 'login',
        loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent),
        title: 'Login - StayEase'
      },
      {
        path: 'register',
        loadComponent: () => import('./features/auth/register/register.component').then(m => m.RegisterComponent),
        title: 'Register - StayEase'
      },
      {
        path: 'forgot-password',
        loadComponent: () => import('./features/auth/forgot-password/forgot-password.component').then(m => m.ForgotPasswordComponent),
        title: 'Forgot Password - StayEase'
      },
      {
        path: '',
        redirectTo: 'login',
        pathMatch: 'full'
      }
    ]
  },

  // Auth0 callback
  {
    path: 'callback',
    loadComponent: () => import('./features/auth/auth0-callback/auth0-callback.component').then(m => m.Auth0CallbackComponent),
    title: 'Completing Sign In...'
  },

  // Legacy OAuth redirect (kept for backwards compatibility)
  {
    path: 'oauth2/redirect',
    loadComponent: () => import('./features/auth/oauth-redirect/oauth-redirect.component').then(m => m.OAuthRedirectComponent),
    title: 'Completing Sign In...'
  },

  // Profile completion (required after registration)
  {
    path: 'profile/complete',
    canActivate: [authGuard],
    loadComponent: () => import('./features/profile/profile-complete.component').then(m => m.ProfileCompleteComponent),
    title: 'Complete Profile - StayEase'
  },

  // User profile routes (for all authenticated users)
  {
    path: 'profile',
    canActivate: [authGuard, profileCompleteGuard],
    children: [
      {
        path: 'view',
        loadComponent: () => import('./features/profile/profile-view/profile-view.component').then(m => m.ProfileViewComponent),
        title: 'My Profile - StayEase'
      },
      {
        path: 'edit',
        loadComponent: () => import('./features/profile/profile-edit/profile-edit.component').then(m => m.ProfileEditComponent),
        title: 'Edit Profile - StayEase'
      },
      {
        path: 'my-listings',
        canActivate: [roleGuard(['ROLE_LANDLORD', 'ROLE_ADMIN'])],
        loadComponent: () => import('./features/profile/listing-list/listing-list.component').then(m => m.ListingListComponent),
        title: 'My Listings - StayEase'
      },
      {
        path: '',
        redirectTo: 'view',
        pathMatch: 'full'
      }
    ]
  },

  // Listing routes (public view, auth required for actions)
  {
    path: 'listing',
    children: [
      {
        path: 'search',
        loadComponent: () => import('./features/listing/listing-search/listing-search.component').then(m => m.ListingSearchComponent),
        title: 'Search Listings - StayEase'
      },
      {
        path: 'create',
        canActivate: [authGuard, profileCompleteGuard, roleGuard(['ROLE_LANDLORD', 'ROLE_ADMIN'])],
        loadComponent: () => import('./features/profile/listing-create/listing-create.component').then(m => m.ListingCreateComponent),
        title: 'Create Listing - StayEase'
      },
      {
        path: ':id',
        loadComponent: () => import('./features/listing/listing-detail/listing-detail.component').then(m => m.ListingDetailComponent),
        title: 'Listing Details - StayEase'
      },
      {
        path: ':id/edit',
        canActivate: [authGuard, profileCompleteGuard, roleGuard(['ROLE_LANDLORD', 'ROLE_ADMIN'])],
        loadComponent: () => import('./features/profile/listing-edit/listing-edit.component').then(m => m.ListingEditComponent),
        title: 'Edit Listing - StayEase'
      },
      {
        path: '',
        redirectTo: 'search',
        pathMatch: 'full'
      }
    ]
  },

  // Booking routes (auth required)
  {
    path: 'booking',
    canActivate: [authGuard, profileCompleteGuard],
    children: [
      {
        path: 'list',
        loadComponent: () => import('./features/booking/booking-list/booking-list.component').then(m => m.BookingListComponent),
        title: 'My Bookings - StayEase'
      },
      {
        path: 'create/:listingId',
        loadComponent: () => import('./features/booking/booking-create/booking-create.component').then(m => m.BookingCreateComponent),
        title: 'Book Property - StayEase'
      },
      {
        path: ':id',
        loadComponent: () => import('./features/booking/booking-detail/booking-detail.component').then(m => m.BookingDetailComponent),
        title: 'Booking Details - StayEase'
      },
      {
        path: '',
        redirectTo: 'list',
        pathMatch: 'full'
      }
    ]
  },

  // Landlord dashboard (landlords and admins only) - NOT IMPLEMENTED YET
  // {
  //   path: 'landlord',
  //   canActivate: [authGuard, profileCompleteGuard, roleGuard(['ROLE_LANDLORD', 'ROLE_ADMIN'])],
  //   children: [
  //     {
  //       path: 'dashboard',
  //       loadComponent: () => import('./features/landlord/landlord-dashboard/landlord-dashboard.component').then(m => m.LandlordDashboardComponent),
  //       title: 'Landlord Dashboard - StayEase'
  //     },
  //     {
  //       path: 'listings',
  //       loadComponent: () => import('./features/landlord/landlord-listings/landlord-listings.component').then(m => m.LandlordListingsComponent),
  //       title: 'My Listings - StayEase'
  //     },
  //     {
  //       path: 'bookings',
  //       loadComponent: () => import('./features/landlord/landlord-bookings/landlord-bookings.component').then(m => m.LandlordBookingsComponent),
  //       title: 'Property Bookings - StayEase'
  //     },
  //     {
  //       path: '',
  //       redirectTo: 'dashboard',
  //       pathMatch: 'full'
  //     }
  //   ]
  // },

  // Admin routes (admins only)
  {
    path: 'admin',
    canActivate: [authGuard, profileCompleteGuard, roleGuard(['ROLE_ADMIN'])],
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./features/admin/admin-dashboard/admin-dashboard.component').then(m => m.AdminDashboardComponent),
        title: 'Admin Dashboard - StayEase'
      },
      // {
      //   path: 'users',
      //   loadComponent: () => import('./features/admin/user-management/user-management.component').then(m => m.UserManagementComponent),
      //   title: 'User Management - StayEase'
      // },
      {
        path: 'listings',
        loadComponent: () => import('./features/admin/listing-management/listing-management.component').then(m => m.ListingManagementComponent),
        title: 'Listing Management - StayEase'
      },
      {
        path: 'bookings',
        loadComponent: () => import('./features/admin/booking-management/booking-management.component').then(m => m.BookingManagementComponent),
        title: 'Booking Management - StayEase'
      },
      // {
      //   path: 'audit-logs',
      //   loadComponent: () => import('./features/admin/audit-log/audit-log.component').then(m => m.AuditLogComponent),
      //   title: 'Audit Logs - StayEase'
      // },
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      }
    ]
  },

  // Service provider routes
  {
    path: 'service-offering',
    children: [
      {
        path: 'list',
        loadComponent: () => import('./features/service-offering/service-list/service-list.component').then(m => m.ServiceListComponent),
        title: 'Services - StayEase'
      },
      {
        path: 'create',
        canActivate: [authGuard, profileCompleteGuard, roleGuard(['ROLE_SERVICE_PROVIDER', 'ROLE_ADMIN'])],
        loadComponent: () => import('./features/service-offering/service-create/service-create.component').then(m => m.ServiceCreateComponent),
        title: 'Create Service - StayEase'
      },
      {
        path: ':id',
        loadComponent: () => import('./features/service-offering/service-detail/service-detail.component').then(m => m.ServiceDetailComponent),
        title: 'Service Details - StayEase'
      },
      {
        path: '',
        redirectTo: 'list',
        pathMatch: 'full'
      }
    ]
  },

  // Chat routes
  // {
  //   path: 'chat',
  //   canActivate: [authGuard, profileCompleteGuard],
  //   loadComponent: () => import('./features/chat/chat-window/chat-window.component').then(m => m.ChatWindowComponent),
  //   title: 'Messages - StayEase'
  // },

  // Error pages
  {
    path: 'unauthorized',
    loadComponent: () => import('./shared/components/unauthorized/unauthorized.component').then(m => m.UnauthorizedComponent),
    title: 'Unauthorized - StayEase'
  },
  // {
  //   path: 'not-found',
  //   loadComponent: () => import('./shared/components/not-found/not-found.component').then(m => m.NotFoundComponent),
  //   title: 'Not Found - StayEase'
  // },

  // Wildcard route - redirect to home
  {
    path: '**',
    redirectTo: ''
  }
];
