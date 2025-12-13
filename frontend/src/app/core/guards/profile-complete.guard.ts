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

  if (!authService.isProfileComplete()) {
    router.navigate(['/profile/complete']);
    return false;
  }

  return true;
};
