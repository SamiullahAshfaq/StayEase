// src/app/core/guards/role.guard.ts
import { CanActivateFn, Router } from "@angular/router";
import { AuthService } from "../auth/auth.service";
import { inject } from "@angular/core";
export const roleGuard = (allowedRoles: string[]): CanActivateFn => {
  return () => {
    const authService = inject(AuthService);
    const router = inject(Router);

    alert('🔒 roleGuard checking for roles: ' + allowedRoles.join(', '));

    if (!authService.isAuthenticated()) {
      alert('❌ roleGuard: NOT AUTHENTICATED - redirecting to login');
      router.navigate(['/auth/login']);
      return false;
    }

    if (!authService.hasAnyRole(allowedRoles)) {
      alert('❌ roleGuard: NO REQUIRED ROLES - redirecting to unauthorized');
      router.navigate(['/unauthorized']);
      return false;
    }

    alert('✅ roleGuard: ACCESS GRANTED!');
    return true;
  };
};
