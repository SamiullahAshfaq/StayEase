import { CanActivateFn, Router } from "@angular/router";
import { AuthService } from "../auth/auth.service";
import { inject } from "@angular/core";

// src/app/core/guards/profile-complete.guard.ts
export const profileCompleteGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.isAuthenticated()) {
    router.navigate(['/auth/login']);
    return false;
  }

  // Profile completion is optional for service providers - they can access features immediately
  const user = authService.getCurrentUser();
  if (user && user.authorities && user.authorities.includes('ROLE_SERVICE_PROVIDER')) {
    return true;
  }

  // For other users, profile completion is still optional
  return true;
};
