import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthService, User } from '../auth/auth.service';

/**
 * @deprecated This service is deprecated. Use Auth0Service instead.
 * Kept for backward compatibility with oauth-redirect component.
 * For new implementations, use @auth0/auth0-angular.
 */
@Injectable({
  providedIn: 'root'
})
export class OAuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private authService = inject(AuthService);

  /**
   * @deprecated Use Auth0Service.loginWithRedirect({ authorizationParams: { connection: 'google-oauth2' } })
   */
  loginWithGoogle(): void {
    console.warn('OAuthService.loginWithGoogle() is deprecated. Use Auth0Service instead.');
    // Redirect to login page where Auth0 is implemented
    this.router.navigate(['/login']);
  }

  /**
   * @deprecated Use Auth0Service.loginWithRedirect({ authorizationParams: { connection: 'facebook' } })
   */
  loginWithFacebook(): void {
    console.warn('OAuthService.loginWithFacebook() is deprecated. Use Auth0Service instead.');
    // Redirect to login page where Auth0 is implemented
    this.router.navigate(['/login']);
  }

  /**
   * @deprecated Legacy OAuth redirect handler. Use Auth0CallbackComponent instead.
   * Handle OAuth redirect and complete authentication
   */
  handleOAuthRedirect(token: string): Observable<User> {
    console.warn('OAuthService.handleOAuthRedirect() is deprecated. Use Auth0 callback flow instead.');
    
    // Store the token
    localStorage.setItem('auth_token', token);

    // Fetch user details
    return this.http.get<{ success: boolean; data: User }>(`${environment.apiUrl}/auth/me`)
      .pipe(
        tap(response => {
          if (response.success && response.data) {
            // Update auth service state
            this.authService.updateCurrentUser(response.data);
          }
        }),
        map(response => response.data)
      );
  }

  /**
   * @deprecated Legacy OAuth code exchange. Use Auth0 flow instead.
   * Exchange authorization code for access token (backend handles this)
   */
  exchangeCodeForToken(code: string, provider: 'google' | 'facebook'): Observable<{ success: boolean; message?: string; data?: { token: string } }> {
    console.warn('OAuthService.exchangeCodeForToken() is deprecated. Use Auth0 flow instead.');
    
    return this.http.post<{ success: boolean; message?: string; data?: { token: string } }>(`${environment.apiUrl}/auth/oauth/callback`, {
      code,
      provider
    });
  }
}
