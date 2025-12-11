import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { OAuthService } from '../services/oauth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const oauthService = inject(OAuthService);
  const router = inject(Router);

  if (oauthService.isAuthenticated()) {
    return true;
  }

  // Store the attempted URL for redirecting
  if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
    localStorage.setItem('redirectUrl', state.url);
  }
  
  // Redirect to login
  router.navigate(['/auth/login'], { 
    queryParams: { returnUrl: state.url }
  });
  
  return false;
};
