import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthService, User } from '../auth/auth.service';

@Injectable({
  providedIn: 'root'
})
export class OAuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private authService = inject(AuthService);

  /**
   * Initiate Google OAuth login
   */
  loginWithGoogle(): void {
    const params = new URLSearchParams({
      client_id: environment.oauth.google.clientId,
      redirect_uri: environment.oauth.google.redirectUri,
      response_type: 'code',
      scope: 'email profile',
      access_type: 'offline',
      prompt: 'consent'
    });

    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
    window.location.href = authUrl;
  }

  /**
   * Initiate Facebook OAuth login
   */
  loginWithFacebook(): void {
    const params = new URLSearchParams({
      client_id: environment.oauth.facebook.clientId,
      redirect_uri: environment.oauth.facebook.redirectUri,
      response_type: 'code',
      scope: 'email,public_profile'
    });

    const authUrl = `https://www.facebook.com/v18.0/dialog/oauth?${params.toString()}`;
    window.location.href = authUrl;
  }

  /**
   * Handle OAuth redirect and complete authentication
   */
  handleOAuthRedirect(token: string): Observable<User> {
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
   * Exchange authorization code for access token (backend handles this)
   */
  exchangeCodeForToken(code: string, provider: 'google' | 'facebook'): Observable<{ success: boolean; message?: string; data?: { token: string } }> {
    return this.http.post<{ success: boolean; message?: string; data?: { token: string } }>(`${environment.apiUrl}/auth/oauth/callback`, {
      code,
      provider
    });
  }
}
