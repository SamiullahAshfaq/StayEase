import { Routes } from '@angular/router';
import { AuthGuard } from './core/auth/auth.guard';
// import { RoleGuard } from './core/guards/role.guard';
// import { LandlordGuard } from './core/guards/landlord.guard';

export const routes: Routes = [
  // Public Routes
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

  // Listing Routes
  {
    path: 'listings',
    loadComponent: () => import('./features/listing/listing-search/listing-search.component').then(m => m.ListingSearchComponent)
  },
  {
    path: 'listings/:id',
    loadComponent: () => import('./features/listing/listing-detail/listing-detail.component').then(m => m.ListingDetailComponent)
  },
  // {
  //   path: 'create-listing',
  //   loadComponent: () => import('./features/listing/listing-create/listing-create.component').then(m => m.ListingCreateComponent),
  //   canActivate: [AuthGuard] // LandlordGuard removed temporarily
  // },

  // Booking Routes
  // {
  //   path: 'bookings',
  //   loadComponent: () => import('./features/booking/booking-list/booking-list.component').then(m => m.BookingListComponent),
  //   canActivate: [AuthGuard]
  // },
  // {
  //   path: 'bookings/:id',
  //   loadComponent: () => import('./features/booking/booking-detail/booking-detail.component').then(m => m.BookingDetailComponent),
  //   canActivate: [AuthGuard]
  // },
  // {
  //   path: 'book/:listingId',
  //   loadComponent: () => import('./features/booking/booking-create/booking-create.component').then(m => m.BookingCreateComponent),
  //   canActivate: [AuthGuard]
  // },

  // Chat Routes
  // {
  //   path: 'messages',
  //   loadComponent: () => import('./features/chat/conversation-list/conversation-list.component').then(m => m.ConversationListComponent),
  //   canActivate: [AuthGuard]
  // },
  // {
  //   path: 'messages/:id',
  //   loadComponent: () => import('./features/chat/chat-window/chat-window.component').then(m => m.ChatWindowComponent),
  //   canActivate: [AuthGuard]
  // },

  // Payment Routes
  // {
  //   path: 'payment/success',
  //   loadComponent: () => import('./features/payment/payment-success/payment-success.component').then(m => m.PaymentSuccessComponent),
  //   canActivate: [AuthGuard]
  // },
  // {
  //   path: 'payment/:bookingId',
  //   loadComponent: () => import('./features/payment/payment-form/payment-form.component').then(m => m.PaymentFormComponent),
  //   canActivate: [AuthGuard]
  // },

  // Profile Routes
  // {
  //   path: 'profile',
  //   loadComponent: () => import('./features/profile/profile-view/profile-view.component').then(m => m.ProfileViewComponent),
  //   canActivate: [AuthGuard]
  // },
  // {
  //   path: 'profile/edit',
  //   loadComponent: () => import('./features/profile/profile-edit/profile-edit.component').then(m => m.ProfileEditComponent),
  //   canActivate: [AuthGuard]
  // },
  // {
  //   path: 'my-listings',
  //   loadComponent: () => import('./features/profile/my-listings/my-listings.component').then(m => m.MyListingsComponent),
  //   canActivate: [AuthGuard] // LandlordGuard removed temporarily
  // },

  // Review Routes
  // {
  //   path: 'reviews/:listingId',
  //   loadComponent: () => import('./features/review/review-list/review-list.component').then(m => m.ReviewListComponent)
  // },
  // {
  //   path: 'review/create/:bookingId',
  //   loadComponent: () => import('./features/review/review-form/review-form.component').then(m => m.ReviewFormComponent),
  //   canActivate: [AuthGuard]
  // },

  // Service Offering Routes
  // {
  //   path: 'services',
  //   loadComponent: () => import('./features/service-offering/service-list/service-list.component').then(m => m.ServiceListComponent)
  // },
  // {
  //   path: 'services/:id',
  //   loadComponent: () => import('./features/service-offering/service-detail/service-detail.component').then(m => m.ServiceDetailComponent)
  // },
  // {
  //   path: 'create-service',
  //   loadComponent: () => import('./features/service-offering/service-create/service-create.component').then(m => m.ServiceCreateComponent),
  //   canActivate: [AuthGuard, LandlordGuard]
  // },

  // Admin Routes
  // {
  //   path: 'admin',
  //   loadComponent: () => import('./features/admin/admin-dashboard/admin-dashboard.component').then(m => m.AdminDashboardComponent),
  //   canActivate: [AuthGuard, RoleGuard],
  //   data: { roles: ['ROLE_ADMIN'] }
  // },
  // {
  //   path: 'admin/users',
  //   loadComponent: () => import('./features/admin/user-management/user-management.component').then(m => m.UserManagementComponent),
  //   canActivate: [AuthGuard, RoleGuard],
  //   data: { roles: ['ROLE_ADMIN'] }
  // },
  // {
  //   path: 'admin/audit',
  //   loadComponent: () => import('./features/admin/audit-log/audit-log.component').then(m => m.AuditLogComponent),
  //   canActivate: [AuthGuard, RoleGuard],
  //   data: { roles: ['ROLE_ADMIN'] }
  // },

  // Fallback
  {
    path: '**',
    redirectTo: ''
  }
];
