import { Routes } from '@angular/router';
import { MainLayoutComponent } from './layout/main-layout/main-layout.component';
import { AuthGuard } from './core/auth/auth.guard';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    component: MainLayoutComponent,
    children: [
      // Home Route - Requires authentication
      {
        path: '',
        loadComponent: () => import('./features/home/home.component').then(m => m.HomeComponent),
        canActivate: [authGuard]
      },

      // Auth Routes
      {
        path: 'auth/login',
        loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent)
      },
      {
        path: 'auth/register',
        loadComponent: () => import('./features/auth/register/register.component').then(m => m.RegisterComponent)
      },
      {
        path: 'oauth2/redirect',
        loadComponent: () => import('./features/auth/oauth-redirect/oauth-redirect.component').then(m => m.OAuthRedirectComponent)
      },

      // Listing Routes
      {
        path: 'listing/search',
        loadComponent: () => import('./features/listing/listing-search/listing-search.component').then(m => m.ListingSearchComponent)
      },
      {
        path: 'listing/:id',
        loadComponent: () => import('./features/listing/listing-detail/listing-detail.component').then(m => m.ListingDetailComponent)
      },
      {
        path: 'listings/:id', // Plural alias for consistency
        loadComponent: () => import('./features/listing/listing-detail/listing-detail.component').then(m => m.ListingDetailComponent)
      },
      {
        path: 'listing/create',
        loadComponent: () => import('./features/listing/listing-create/listing-create.component').then(m => m.ListingCreateComponent),
        canActivate: [AuthGuard]
      },

      // Booking Routes - COMMENTED OUT - Components not built yet
      {
        path: 'booking/list',
        loadComponent: () => import('./features/booking/booking-list/booking-list.component').then(m => m.BookingListComponent),
        canActivate: [AuthGuard]
      },
      {
        path: 'booking/:id',
        loadComponent: () => import('./features/booking/booking-detail/booking-detail.component').then(m => m.BookingDetailComponent),
        canActivate: [AuthGuard]
      },
      {
        path: 'booking/create/:listingId',
        loadComponent: () => import('./features/booking/booking-create/booking-create.component').then(m => m.BookingCreateComponent),
        canActivate: [AuthGuard]
      },

      // Chat Routes - COMMENTED OUT - Components not built yet
      // {
      //   path: 'chat',
      //   loadComponent: () => import('./features/chat/conversation-list/conversation-list.component').then(m => m.ConversationListComponent),
      //   canActivate: [AuthGuard]
      // },
      // {
      //   path: 'chat/:id',
      //   loadComponent: () => import('./features/chat/chat-window/chat-window.component').then(m => m.ChatWindowComponent),
      //   canActivate: [AuthGuard]
      // },

      // Payment Routes - COMMENTED OUT - Components not built yet
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

      // Profile Routes - COMMENTED OUT - Components not built yet
      // {
      //   path: 'profile/view',
      //   loadComponent: () => import('./features/profile/profile-view/profile-view.component').then(m => m.ProfileViewComponent),
      //   canActivate: [AuthGuard]
      // },
      // {
      //   path: 'profile/edit',
      //   loadComponent: () => import('./features/profile/profile-edit/profile-edit.component').then(m => m.ProfileEditComponent),
      //   canActivate: [AuthGuard]
      // },
      // {
      //   path: 'profile/my-listings',
      //   loadComponent: () => import('./features/profile/my-listings/my-listings.component').then(m => m.MyListingsComponent),
      //   canActivate: [AuthGuard]
      // },

      // Review Routes - COMMENTED OUT - Components not built yet
      // {
      //   path: 'review/:listingId',
      //   loadComponent: () => import('./features/review/review-list/review-list.component').then(m => m.ReviewListComponent)
      // },
      // {
      //   path: 'review/create/:bookingId',
      //   loadComponent: () => import('./features/review/review-form/review-form.component').then(m => m.ReviewFormComponent),
      //   canActivate: [AuthGuard]
      // },

      // Service Offering Routes - COMMENTED OUT - Components not built yet
      // {
      //   path: 'service-offering/list',
      //   loadComponent: () => import('./features/service-offering/service-list/service-list.component').then(m => m.ServiceListComponent)
      // },
      // {
      //   path: 'service-offering/:id',
      //   loadComponent: () => import('./features/service-offering/service-detail/service-detail.component').then(m => m.ServiceDetailComponent)
      // },
      // {
      //   path: 'service-offering/create',
      //   loadComponent: () => import('./features/service-offering/service-create/service-create.component').then(m => m.ServiceCreateComponent),
      //   canActivate: [AuthGuard]
      // },

      // Admin Routes - COMMENTED OUT - Components not built yet
      // {
      //   path: 'admin/dashboard',
      //   loadComponent: () => import('./features/admin/admin-dashboard/admin-dashboard.component').then(m => m.AdminDashboardComponent),
      //   canActivate: [AuthGuard]
      // },
      // {
      //   path: 'admin/users',
      //   loadComponent: () => import('./features/admin/user-management/user-management.component').then(m => m.UserManagementComponent),
      //   canActivate: [AuthGuard]
      // },
      // {
      //   path: 'admin/audit',
      //   loadComponent: () => import('./features/admin/audit-log/audit-log.component').then(m => m.AuditLogComponent),
      //   canActivate: [AuthGuard]
      // },
    ]
  },

  // Fallback
  {
    path: '**',
    redirectTo: ''
  }
];
