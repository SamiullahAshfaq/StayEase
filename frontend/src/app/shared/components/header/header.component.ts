import { Component, inject, OnInit, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { AuthService, User } from '../../../core/auth/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './header.component.html'
})
export class HeaderComponent implements OnInit {
  private platformId = inject(PLATFORM_ID);
  authService = inject(AuthService);
  router = inject(Router);
  isMenuOpen = false;

  // Reactive properties
  currentUser: User | null = null;
  isAuthenticated = false;

  ngOnInit() {
    console.log('Header Component ngOnInit called');
    console.log('Is Browser?', isPlatformBrowser(this.platformId));

    // Only initialize auth state in browser
    if (isPlatformBrowser(this.platformId)) {
      // Small delay to ensure localStorage is accessible
      setTimeout(() => {
        this.updateAuthState();

        // Subscribe to user changes
        this.authService.currentUser$.subscribe(user => {
          console.log('Header - User changed:', user);
          this.updateAuthState();
        });
      }, 0);
    }
  }

  private updateAuthState() {
    this.currentUser = this.authService.getCurrentUser();
    this.isAuthenticated = this.authService.isAuthenticated();
    console.log('Header - Auth state updated');
    console.log('Header - isAuthenticated:', this.isAuthenticated);
    console.log('Header - currentUser:', this.currentUser);
  }

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }

  login() {
    this.router.navigate(['/auth/login']);
  }

  signup() {
    this.router.navigate(['/auth/register']);
  }

  logout() {
    this.authService.logout();
  }
}
