import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, BehaviorSubject, tap, catchError, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { StorageService } from '../services/storage.service';
import { UserDTO } from '../models/user.model';
import { ApiResponse } from '../models/api-response.model';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  authorities: string[];
}

export interface AuthResponse {
  user: UserDTO;
  token: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private storage = inject(StorageService);

  private currentUserSubject = new BehaviorSubject<UserDTO | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();
  
  // Signal for reactive state management
  public isAuthenticated = signal<boolean>(false);
  public currentUserSignal = signal<UserDTO | null>(null);

  private readonly TOKEN_KEY = 'auth_token';
  private readonly USER_KEY = 'current_user';

  constructor() {
    this.loadStoredUser();
  }

  private loadStoredUser(): void {
    const token = this.storage.getItem(this.TOKEN_KEY);
    const userStr = this.storage.getItem(this.USER_KEY);
    
    if (token && userStr) {
      try {
        const user = JSON.parse(userStr) as UserDTO;
        this.currentUserSubject.next(user);
        this.currentUserSignal.set(user);
        this.isAuthenticated.set(true);
      } catch (error) {
        this.clearAuthData();
      }
    }
  }

  login(credentials: LoginRequest): Observable<ApiResponse<AuthResponse>> {
    return this.http.post<ApiResponse<AuthResponse>>(
      `${environment.apiUrl}/auth/login`,
      credentials
    ).pipe(
      tap(response => {
        if (response.data) {
          this.handleAuthSuccess(response.data);
        }
      }),
      catchError(error => {
        console.error('Login error:', error);
        return throwError(() => error);
      })
    );
  }

  register(data: RegisterRequest): Observable<ApiResponse<UserDTO>> {
    return this.http.post<ApiResponse<UserDTO>>(
      `${environment.apiUrl}/auth/register`,
      data
    ).pipe(
      tap(response => {
        console.log('Registration successful:', response);
      }),
      catchError(error => {
        console.error('Registration error:', error);
        return throwError(() => error);
      })
    );
  }

  getCurrentUser(): Observable<ApiResponse<UserDTO>> {
    return this.http.get<ApiResponse<UserDTO>>(
      `${environment.apiUrl}/auth/me`
    ).pipe(
      tap(response => {
        if (response.data) {
          this.currentUserSubject.next(response.data);
          this.currentUserSignal.set(response.data);
          this.storage.setItem(this.USER_KEY, JSON.stringify(response.data));
        }
      })
    );
  }

  logout(): void {
    this.http.post(`${environment.apiUrl}/auth/logout`, {}).subscribe({
      complete: () => {
        this.clearAuthData();
        this.router.navigate(['/login']);
      },
      error: () => {
        // Clear auth data even if logout request fails
        this.clearAuthData();
        this.router.navigate(['/login']);
      }
    });
  }

  private handleAuthSuccess(authResponse: AuthResponse): void {
    this.storage.setItem(this.TOKEN_KEY, authResponse.token);
    this.storage.setItem(this.USER_KEY, JSON.stringify(authResponse.user));
    this.currentUserSubject.next(authResponse.user);
    this.currentUserSignal.set(authResponse.user);
    this.isAuthenticated.set(true);
  }

  private clearAuthData(): void {
    this.storage.removeItem(this.TOKEN_KEY);
    this.storage.removeItem(this.USER_KEY);
    this.currentUserSubject.next(null);
    this.currentUserSignal.set(null);
    this.isAuthenticated.set(false);
  }

  getToken(): string | null {
    return this.storage.getItem(this.TOKEN_KEY);
  }

  hasRole(role: string): boolean {
    const user = this.currentUserSignal();
    return user?.authorities?.includes(role) || false;
  }

  isLandlord(): boolean {
    return this.hasRole('ROLE_LANDLORD');
  }

  isTenant(): boolean {
    return this.hasRole('ROLE_TENANT');
  }

  isAdmin(): boolean {
    return this.hasRole('ROLE_ADMIN');
  }
}
