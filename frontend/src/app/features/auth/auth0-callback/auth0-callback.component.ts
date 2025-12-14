import { Component, OnInit, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService as Auth0Service } from '@auth0/auth0-angular';
import { AuthService } from '../../../core/auth/auth.service';

@Component({
  selector: 'app-auth0-callback',
  standalone: true,
  template: `
    <div class="min-h-screen flex items-center justify-center bg-[#F4F4F4]">
      <div class="text-center">
        <div class="inline-block animate-spin rounded-full h-16 w-16 border-4 border-[#00B7B5] border-t-transparent"></div>
        <h2 class="mt-4 text-xl font-semibold text-[#005461]">
          {{ message }}
        </h2>
        @if (error) {
          <p class="mt-2 text-red-600">{{ error }}</p>
          <button (click)="goToLogin()" class="mt-4 px-6 py-2 bg-[#00B7B5] text-white rounded-lg hover:bg-[#018790]">
            Back to Login
          </button>
        }
      </div>
    </div>
  `
})
export class Auth0CallbackComponent implements OnInit {
  private auth0 = inject(Auth0Service, { optional: true });
  private authService = inject(AuthService);
  private router = inject(Router);
  private platformId = inject(PLATFORM_ID);

  message = 'Completing sign in...';
  error: string | null = null;

  ngOnInit() {
    // Only handle callback in browser, not during SSR
    if (!isPlatformBrowser(this.platformId) || !this.auth0) {
      return;
    }

    // CRITICAL: Handle Auth0 errors FIRST before checking authentication
    this.auth0.error$.subscribe(error => {
      if (error) {
        console.error('Auth0 error:', error);

        // Check for specific "Unauthorized" error related to audience/API
        if (error.message && error.message.includes('Unauthorized')) {
          this.error = '⚠️ Auth0 API not configured. Please create an API in Auth0 Dashboard with identifier: https://stayease-api';
          console.error('❌ Auth0 Configuration Error:', {
            problem: 'Missing API or incorrect audience',
            solution: 'Go to Auth0 Dashboard → Applications → APIs → Create API',
            requiredIdentifier: 'https://stayease-api',
            currentError: error
          });
        } else {
          this.error = error.message || 'Authentication failed. Please try again.';
        }
        return; // Stop processing if there's an error
      }
    });

    // Auth0 automatically handles the callback
    // We just need to wait for the authentication to complete
    this.auth0.isAuthenticated$.subscribe({
      next: (isAuthenticated) => {
        console.log('Auth0 authentication status:', isAuthenticated);

        if (isAuthenticated && this.auth0) {
          this.message = 'Fetching user profile...';

          // Get the Auth0 user and token
          this.auth0.user$.subscribe({
            next: (auth0User) => {
              console.log('Auth0 user:', auth0User);

              if (auth0User && this.auth0) {
                // Get the Auth0 access token
                this.auth0.getAccessTokenSilently().subscribe({
                  next: (auth0Token) => {
                    console.log('✅ Got Auth0 token, syncing with backend...');
                    this.message = 'Syncing with server...';

                    // Sync with our backend - backend will validate Auth0 token and return local JWT
                    this.authService.syncAuth0User(auth0User, auth0Token).subscribe({
                      next: () => {
                        console.log('✅ User synced successfully');
                        this.message = 'Redirecting...';
                        // Check if profile is complete
                        if (this.authService.isProfileComplete()) {
                          this.router.navigate(['/']);
                        } else {
                          this.router.navigate(['/profile/complete']);
                        }
                      },
                      error: (err) => {
                        console.error('❌ Failed to sync user with backend:', err);
                        this.error = 'Failed to complete sign in with backend. Please try again.';
                      }
                    });
                  },
                  error: (err) => {
                    console.error('❌ Failed to get Auth0 token:', err);
                    this.error = 'Failed to get authentication token. This usually means Auth0 API is not configured.';
                  }
                });
              }
            },
            error: (err) => {
              console.error('❌ Failed to get Auth0 user:', err);
              this.error = 'Failed to get user information. Please try again.';
            }
          });
        } else if (!isAuthenticated) {
          console.warn('⚠️ User is not authenticated, redirecting to login...');
          setTimeout(() => this.router.navigate(['/auth/login']), 2000);
        }
      },
      error: (err) => {
        console.error('❌ Auth0 authentication check failed:', err);
        this.error = 'Authentication verification failed. Please try again.';
      }
    });
  }

  goToLogin() {
    this.router.navigate(['/auth/login']);
  }
}
