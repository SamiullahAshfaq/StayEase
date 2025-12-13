// src/app/core/auth/auth.service.ts
import { Injectable, inject, signal, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, BehaviorSubject, tap, catchError, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface AuthResponse {
  success: boolean;
  message?: string;
  data: {
    token: string;
    tokenType: string;
    expiresIn: number;
    user: User;
  };
}

export interface User {
  publicId: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  profileImageUrl?: string;
  bio?: string;
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  isActive: boolean;
  authorities: string[];
  lastLoginAt?: string;
  createdAt: string;
  updatedAt: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private platformId = inject(PLATFORM_ID);

  private readonly API_URL = `${environment.apiUrl}/auth`;
  private readonly TOKEN_KEY = 'auth_token';
  private readonly USER_KEY = 'current_user';

  private currentUserSubject = new BehaviorSubject<User | null>(this.getUserFromStorage());
  public currentUser$ = this.currentUserSubject.asObservable();

  // Signals for reactive state
  public isAuthenticated = signal<boolean>(this.hasToken());
  public currentUser = signal<User | null>(this.getUserFromStorage());

  constructor() {
    // Initialize authentication state on service creation (only in browser)
    if (isPlatformBrowser(this.platformId)) {
      this.checkAuthState();
    }
  }

  /**
   * Check authentication state on app initialization
   */
  private checkAuthState(): void {
    const token = this.getToken();
    const user = this.getUserFromStorage();

    if (token && user) {
      this.isAuthenticated.set(true);
      this.currentUser.set(user);
      this.currentUserSubject.next(user);
    } else {
      this.clearAuth();
    }
  }

  /**
   * Login with email and password
   */
  login(credentials: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.API_URL}/login`, credentials)
      .pipe(
        tap(response => {
          if (response.success && response.data) {
            this.handleAuthSuccess(response.data);
          }
        }),
        catchError(error => {
          console.error('Login error:', error);
          return throwError(() => error);
        })
      );
  }

  /**
   * Register new user
   */
  register(userData: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.API_URL}/register`, userData)
      .pipe(
        tap(response => {
          if (response.success && response.data) {
            this.handleAuthSuccess(response.data);
          }
        }),
        catchError(error => {
          console.error('Registration error:', error);
          return throwError(() => error);
        })
      );
  }

  /**
   * Handle successful authentication
   */
  private handleAuthSuccess(data: AuthResponse['data']): void {
    // Store token and user data (only in browser)
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem(this.TOKEN_KEY, data.token);
      localStorage.setItem(this.USER_KEY, JSON.stringify(data.user));
    }

    // Update state
    this.isAuthenticated.set(true);
    this.currentUser.set(data.user);
    this.currentUserSubject.next(data.user);

    console.log('Auth success:', data.user);
  }

  /**
   * Logout user
   */
  logout(): void {
    this.http.post(`${this.API_URL}/logout`, {}).subscribe({
      complete: () => {
        this.clearAuth();
        this.router.navigate(['/auth/login']);
      }
    });
  }

  /**
   * Clear authentication state
   */
  private clearAuth(): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem(this.TOKEN_KEY);
      localStorage.removeItem(this.USER_KEY);
    }
    this.isAuthenticated.set(false);
    this.currentUser.set(null);
    this.currentUserSubject.next(null);
  }

  /**
   * Get stored token
   */
  getToken(): string | null {
    if (!isPlatformBrowser(this.platformId)) {
      return null;
    }
    return localStorage.getItem(this.TOKEN_KEY);
  }

  /**
   * Check if user has token
   */
  private hasToken(): boolean {
    return !!this.getToken();
  }

  /**
   * Get user from storage
   */
  private getUserFromStorage(): User | null {
    if (!isPlatformBrowser(this.platformId)) {
      return null;
    }
    const userStr = localStorage.getItem(this.USER_KEY);
    if (userStr) {
      try {
        return JSON.parse(userStr);
      } catch {
        return null;
      }
    }
    return null;
  }

  /**
   * Get current user value
   */
  getCurrentUser(): User | null {
    return this.currentUser();
  }

  /**
   * Check if user has specific role
   */
  hasRole(role: string): boolean {
    const user = this.currentUser();
    return user?.authorities?.includes(role) || false;
  }

  /**
   * Check if user has any of the specified roles
   */
  hasAnyRole(roles: string[]): boolean {
    const user = this.currentUser();
    return roles.some(role => user?.authorities?.includes(role)) || false;
  }

  /**
   * Check if profile is complete
   */
  isProfileComplete(): boolean {
    const user = this.currentUser();
    return !!(user?.phoneNumber && user?.profileImageUrl && user?.bio);
  }

  /**
   * Update current user data
   */
  updateCurrentUser(user: User): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem(this.USER_KEY, JSON.stringify(user));
    }
    this.currentUser.set(user);
    this.currentUserSubject.next(user);
  }

  /**
   * Refresh user data from server
   */
  refreshCurrentUser(): Observable<User> {
    return this.http.get<{ success: boolean; data: User }>(`${this.API_URL}/me`)
      .pipe(
        tap(response => {
          if (response.success && response.data) {
            this.updateCurrentUser(response.data);
          }
        }),
        tap(response => response.data),
        catchError(error => {
          console.error('Failed to refresh user:', error);
          return throwError(() => error);
        })
      ) as unknown as Observable<User>;
  }

  /**
   * Forgot password
   */
  forgotPassword(email: string): Observable<{ success: boolean; message?: string }> {
    return this.http.post<{ success: boolean; message?: string }>(`${this.API_URL}/forgot-password`, { email });
  }

  /**
   * Reset password
   */
  resetPassword(token: string, newPassword: string): Observable<{ success: boolean; message?: string }> {
    return this.http.post<{ success: boolean; message?: string }>(`${this.API_URL}/reset-password`, { token, newPassword });
  }

  /**
   * Change password
   */
  changePassword(oldPassword: string, newPassword: string): Observable<{ success: boolean; message?: string }> {
    return this.http.post<{ success: boolean; message?: string }>(`${this.API_URL}/change-password`, { oldPassword, newPassword });
  }
}
