// src/app/core/interceptors/auth.interceptor.ts
import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../auth/auth.service';
import { catchError, throwError } from 'rxjs';
import { Router } from '@angular/router';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const token = authService.getToken();

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
      // Don't intercept errors on auth endpoints (login, register, etc.)
      if (req.url.includes('/api/auth/')) {
        return throwError(() => error);
      }

      // Handle 401 Unauthorized errors (but not for logout requests)
      if (error.status === 401 && !req.url.includes('/logout')) {
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
