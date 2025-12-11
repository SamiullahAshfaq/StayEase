import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject, tap, map } from 'rxjs';
import { Router } from '@angular/router';

export interface AuthResponse {
  token: string;
  tokenType: string;
  user: {
    id: string;
    email: string;
    name: string;
    imageUrl?: string;
    provider: 'GOOGLE' | 'FACEBOOK' | 'LOCAL';
    roles: string[];
  };
}

export interface User {
  id: string;
  email: string;
  name: string;
  imageUrl?: string;
  provider: 'GOOGLE' | 'FACEBOOK' | 'LOCAL';
  roles: string[];
}

@Injectable({
  providedIn: 'root'
})
export class OAuthService {
  private readonly API_URL = 'http://localhost:8080/api';
  private readonly OAUTH2_REDIRECT_URI = 'http://localhost:4200/oauth2/redirect';
  
  private currentUserSubject = new BehaviorSubject<User | null>(this.getUserFromStorage());
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(
    private http: HttpClient,
    private router: Router
  ) {}

  /**
   * Get current user from localStorage
   */
  private getUserFromStorage(): User | null {
    if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
      console.log('getUserFromStorage: SSR environment, returning null');
      return null;
    }
    
    const token = this.getToken();
    const userStr = localStorage.getItem('user');
    
    console.log('getUserFromStorage - token:', token ? 'Present' : 'None');
    console.log('getUserFromStorage - userStr:', userStr);
    
    if (token && userStr) {
      try {
        const user = JSON.parse(userStr);
        console.log('getUserFromStorage - parsed user:', user);
        return user;
      } catch (e) {
        console.error('Error parsing user from localStorage', e);
        return null;
      }
    }
    console.log('getUserFromStorage - returning null (no token or user)');
    return null;
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    const token = this.getToken();
    if (!token) {
      return false;
    }
    
    // Check if token is expired
    try {
      const payload = this.parseJwt(token);
      const expiry = payload.exp * 1000; // Convert to milliseconds
      return Date.now() < expiry;
    } catch (e) {
      return false;
    }
  }

  /**
   * Get stored JWT token
   */
  getToken(): string | null {
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      return localStorage.getItem('token');
    }
    return null;
  }

  /**
   * Get current user
   */
  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  /**
   * Parse JWT token
   */
  private parseJwt(token: string): any {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch (e) {
      console.error('Error parsing JWT', e);
      return null;
    }
  }

  /**
   * Initiate Google OAuth login
   */
  loginWithGoogle(): void {
    window.location.href = `${this.API_URL}/oauth2/authorization/google`;
  }

  /**
   * Initiate Facebook OAuth login
   */
  loginWithFacebook(): void {
    window.location.href = `${this.API_URL}/oauth2/authorization/facebook`;
  }

  /**
   * Traditional email/password login
   */
  loginWithEmail(email: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.API_URL}/auth/login`, {
      email,
      password
    }).pipe(
      tap(response => this.handleAuthSuccess(response))
    );
  }

  /**
   * Register new user
   */
  register(name: string, email: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.API_URL}/auth/register`, {
      name,
      email,
      password
    }).pipe(
      tap(response => this.handleAuthSuccess(response))
    );
  }

  /**
   * Handle successful authentication
   */
  handleAuthSuccess(response: AuthResponse): void {
    if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
      return;
    }
    
    // Store token and user info
    localStorage.setItem('token', response.token);
    localStorage.setItem('user', JSON.stringify(response.user));
    
    // Update current user
    this.currentUserSubject.next(response.user);
  }

  /**
   * Handle OAuth redirect with token
   */
  handleOAuthRedirect(token: string): Observable<User> {
    console.log('handleOAuthRedirect called with token:', token ? 'Token present' : 'No token');
    console.log('Browser check - window:', typeof window, 'localStorage:', typeof localStorage);
    
    // Check if we're in a browser environment
    if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
      console.warn('handleOAuthRedirect called in SSR environment, skipping');
      // Return an observable that emits an error so the component knows what happened
      return new Observable(observer => {
        observer.error(new Error('SSR environment - localStorage not available'));
      });
    }
    
    console.log('Storing token in localStorage...');
    // Store token
    localStorage.setItem('token', token);
    
    console.log('Fetching user details from backend...');
    // Fetch user details
    return this.fetchUserDetails().pipe(
      tap(user => {
        console.log('Extracted user details:', user);
        console.log('User email:', user.email);
        console.log('User name:', user.name);
        localStorage.setItem('user', JSON.stringify(user));
        this.currentUserSubject.next(user);
        console.log('currentUserSubject updated with:', this.currentUserSubject.value);
      })
    );
  }

  /**
   * Fetch current user details from backend
   */
  private fetchUserDetails(): Observable<User> {
    return this.http.get<any>(`${this.API_URL}/auth/me`).pipe(
      tap(response => console.log('Raw API response:', response)),
      map(response => {
        // Check if response is wrapped in a data object
        if (response.data) {
          console.log('Extracting user from wrapped response:', response.data);
          return response.data;
        }
        console.log('Using response directly as user');
        return response;
      }),
      tap(user => console.log('After map - user is now:', user))
    );
  }

  /**
   * Logout user
   */
  logout(): void {
    const token = this.getToken();
    
    if (token) {
      // Call backend logout (optional - records activity)
      this.http.post(`${this.API_URL}/auth/logout`, {}).subscribe({
        complete: () => this.clearAuthData()
      });
    } else {
      this.clearAuthData();
    }
  }

  /**
   * Clear authentication data
   */
  private clearAuthData(): void {
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
    this.currentUserSubject.next(null);
    this.router.navigate(['/auth/login']);
  }

  /**
   * Get user activities
   */
  getUserActivities(page: number = 0, size: number = 20): Observable<any> {
    return this.http.get(`${this.API_URL}/auth/activities?page=${page}&size=${size}`);
  }

  /**
   * Check if user has specific role
   */
  hasRole(role: string): boolean {
    const user = this.getCurrentUser();
    return user?.roles?.includes(role) || false;
  }

  /**
   * Check if user is admin
   */
  isAdmin(): boolean {
    return this.hasRole('ROLE_ADMIN');
  }
}
