import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { OAuthService } from '../../../core/services/oauth.service';

@Component({
  selector: 'app-oauth-redirect',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="oauth-redirect-container">
      <div class="oauth-redirect-content">
        <div *ngIf="!error" class="loading-state">
          <div class="spinner"></div>
          <h2>Completing sign in...</h2>
          <p>Please wait while we log you in</p>
        </div>

        <div *ngIf="error" class="error-state">
          <div class="error-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <circle cx="12" cy="12" r="10" stroke-width="2"/>
              <line x1="12" y1="8" x2="12" y2="12" stroke-width="2"/>
              <line x1="12" y1="16" x2="12.01" y2="16" stroke-width="2"/>
            </svg>
          </div>
          <h2>Authentication Failed</h2>
          <p>{{ error }}</p>
          <button (click)="goToLogin()" class="btn-primary">
            Back to Login
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .oauth-redirect-container {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 20px;
    }

    .oauth-redirect-content {
      text-align: center;
      color: white;
    }

    .loading-state h2 {
      font-size: 24px;
      font-weight: 600;
      margin: 24px 0 12px;
    }

    .loading-state p {
      font-size: 16px;
      opacity: 0.9;
    }

    .spinner {
      margin: 0 auto;
      width: 60px;
      height: 60px;
      border: 4px solid rgba(255, 255, 255, 0.3);
      border-top-color: white;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      to {
        transform: rotate(360deg);
      }
    }

    .error-state {
      background: white;
      border-radius: 16px;
      padding: 40px;
      max-width: 400px;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
    }

    .error-icon {
      width: 64px;
      height: 64px;
      margin: 0 auto 20px;
      color: #f56565;
    }

    .error-icon svg {
      width: 100%;
      height: 100%;
    }

    .error-state h2 {
      font-size: 24px;
      font-weight: 700;
      color: #1a202c;
      margin-bottom: 12px;
    }

    .error-state p {
      font-size: 16px;
      color: #718096;
      margin-bottom: 24px;
    }

    .btn-primary {
      padding: 12px 32px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border: none;
      border-radius: 8px;
      font-size: 16px;
      font-weight: 600;
      cursor: pointer;
      transition: transform 0.3s ease;
    }

    .btn-primary:hover {
      transform: translateY(-2px);
    }
  `]
})
export class OAuthRedirectComponent implements OnInit {
  error: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private oauthService: OAuthService
  ) {}

  ngOnInit(): void {
    console.log('OAuthRedirectComponent initialized');
    console.log('Window check:', typeof window);
    
    // Skip OAuth redirect handling during SSR
    if (typeof window === 'undefined') {
      console.log('SSR detected, skipping OAuth redirect');
      return;
    }

    console.log('Browser environment detected, proceeding with OAuth redirect');
    
    // Get token from URL query params or fragment
    const token = this.route.snapshot.queryParams['token'] || 
                  this.getTokenFromFragment();
    
    console.log('Token from URL:', token ? 'Present' : 'Missing');
    
    const error = this.route.snapshot.queryParams['error'];
    console.log('Error from URL:', error);

    if (error) {
      console.error('OAuth error received:', error);
      this.error = this.getErrorMessage(error);
      return;
    }

    if (!token) {
      console.error('No token found in URL');
      this.error = 'No authentication token received';
      return;
    }

    console.log('Starting OAuth redirect process...');
    // Handle successful OAuth login
    this.oauthService.handleOAuthRedirect(token).subscribe({
      next: (user) => {
        console.log('OAuth login successful', user);
        
        // Redirect to home or return URL
        const returnUrl = localStorage.getItem('redirectUrl') || '/';
        localStorage.removeItem('redirectUrl');
        
        console.log('Redirecting to:', returnUrl);
        setTimeout(() => {
          this.router.navigate([returnUrl]);
        }, 1000);
      },
      error: (err) => {
        console.error('OAuth login error:', err);
        this.error = 'Failed to complete sign in. Please try again.';
      },
      complete: () => {
        console.log('OAuth observable completed');
      }
    });
  }

  /**
   * Extract token from URL fragment (#token=...)
   */
  private getTokenFromFragment(): string | null {
    const fragment = window.location.hash.substring(1);
    const params = new URLSearchParams(fragment);
    return params.get('token');
  }

  /**
   * Get user-friendly error message
   */
  private getErrorMessage(error: string): string {
    const errorMessages: { [key: string]: string } = {
      'access_denied': 'You denied access to your account',
      'unauthorized': 'Authentication failed. Please try again.',
      'invalid_token': 'Invalid authentication token',
      'expired_token': 'Authentication token has expired'
    };

    return errorMessages[error] || `Authentication error: ${error}`;
  }

  /**
   * Navigate back to login page
   */
  goToLogin(): void {
    this.router.navigate(['/login']);
  }
}
