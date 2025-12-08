import { Injectable, PLATFORM_ID, Inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';
import { 
  User, 
  RegisterRequest, 
  LoginRequest, 
  AuthResponse 
} from '../models/user.model';
import { ApiResponse } from '../models/api-response.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = `${environment.apiUrl}/auth`;
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(
    private http: HttpClient,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: object
  ) {
    this.loadStoredUser();
  }

  private loadStoredUser(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }
    
    const token = this.getToken();
    const userStr = localStorage.getItem('currentUser');
    
    if (token && userStr) {
      try {
        const user = JSON.parse(userStr);
        this.currentUserSubject.next(user);
      } catch (e) {
        this.logout();
      }
    }
  }

  register(data: RegisterRequest): Observable<ApiResponse<AuthResponse>> {
    return this.http.post<ApiResponse<AuthResponse>>(`${this.apiUrl}/register`, data)
      .pipe(
        tap(response => {
          if (response.success && response.data) {
            this.setAuth(response.data);
          }
        })
      );
  }

  login(data: LoginRequest): Observable<ApiResponse<AuthResponse>> {
    return this.http.post<ApiResponse<AuthResponse>>(`${this.apiUrl}/login`, data)
      .pipe(
        tap(response => {
          if (response.success && response.data) {
            this.setAuth(response.data);
          }
        })
      );
  }

  logout(): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('token');
      localStorage.removeItem('currentUser');
    }
    this.currentUserSubject.next(null);
    this.router.navigate(['/']);
  }

  getCurrentUser(): Observable<ApiResponse<User>> {
    return this.http.get<ApiResponse<User>>(`${this.apiUrl}/me`)
      .pipe(
        tap(response => {
          if (response.success && response.data) {
            if (isPlatformBrowser(this.platformId)) {
              localStorage.setItem('currentUser', JSON.stringify(response.data));
            }
            this.currentUserSubject.next(response.data);
          }
        })
      );
  }

  private setAuth(authResponse: AuthResponse): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('token', authResponse.token);
      localStorage.setItem('currentUser', JSON.stringify(authResponse.user));
    }
    this.currentUserSubject.next(authResponse.user);
  }

  getToken(): string | null {
    if (!isPlatformBrowser(this.platformId)) {
      return null;
    }
    return localStorage.getItem('token');
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  hasRole(role: string): boolean {
    const user = this.currentUserSubject.value;
    return user?.authorities?.includes(role) || false;
  }

  isLandlord(): boolean {
    return this.hasRole('ROLE_LANDLORD');
  }

  isAdmin(): boolean {
    return this.hasRole('ROLE_ADMIN');
  }

  get currentUserValue(): User | null {
    return this.currentUserSubject.value;
  }
}