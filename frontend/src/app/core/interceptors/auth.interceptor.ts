// src/app/core/interceptors/auth.interceptor.ts
import { HttpInterceptorFn } from '@angular/common/http';
import { inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { AuthService } from '../auth/auth.service';
import { catchError, throwError } from 'rxjs';
import { Router } from '@angular/router';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const token = authService.getToken();

  // Debug logging for token attachment
  if (isPlatformBrowser(inject(PLATFORM_ID))) {
    console.log(`[Interceptor] ${req.method} ${req.url}`);
    console.log(`[Interceptor] Token exists:`, !!token);
    if (token) {
      console.log(`[Interceptor] Token preview:`, token.substring(0, 20) + '...');
    }
  }

  // Clone request and add authorization header if token exists
  if (token) {
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  return next(req).pipe(
    catchError((error) => {
      // List of public API endpoints that don't require authentication
      const publicEndpoints = [
        '/api/auth/',
        '/api/listings',
        '/api/services',
        '/api/reviews'
      ];

      // Check if this is a public endpoint
      const isPublicEndpoint = publicEndpoints.some(endpoint => req.url.includes(endpoint));

      // CRITICAL FIX: Don't logout on public endpoint 401s - just pass error through
      if (isPublicEndpoint) {
        console.warn(`[Interceptor] ${error.status} on public endpoint - ignoring`);
        return throwError(() => error);
      }

      // Only handle auth errors on protected endpoints
      if (error.status === 401 && !req.url.includes('/logout')) {
        console.error('[Interceptor] 401 on protected endpoint - logging out');
        authService.logout();
        router.navigate(['/auth/login'], {
          queryParams: { returnUrl: router.url, error: 'Session expired' }
        });
      }

      // Handle 403 Forbidden errors
      if (error.status === 403) {
        router.navigate(['/unauthorized']);
      }

      return throwError(() => error);
    })
  );
};
