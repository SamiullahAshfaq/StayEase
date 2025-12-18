import { CanActivateFn, Router } from "@angular/router";
import { AuthService } from "../auth/auth.service";
import { inject } from "@angular/core/primitives/di";

// src/app/core/guards/guest.guard.ts
export const guestGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isAuthenticated()) {
    const user = authService.getCurrentUser();

    // If profile not complete, go to profile completion
    if (!authService.isProfileComplete()) {
      router.navigate(['/profile/complete']);
      return false;
    }

    // Navigate based on role
    if (user?.authorities.includes('ROLE_ADMIN')) {
      router.navigate(['/admin/dashboard']);
    } else if (user?.authorities.includes('ROLE_LANDLORD')) {
      router.navigate(['/profile/my-listings']); // Fixed: Navigate to my listings instead
    } else {
      router.navigate(['/']);
    }
    return false;
  }

  return true;
};
