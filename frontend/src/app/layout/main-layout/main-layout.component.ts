import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink } from '@angular/router';
import { OAuthService } from '../../core/services/oauth.service';
import { Observable } from 'rxjs';
import { User } from '../../core/services/oauth.service';

@Component({
  selector: 'app-main-layout',
  templateUrl: './main-layout.component.html',
  styleUrls: ['./main-layout.component.css'],
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink]
})
export class MainLayoutComponent implements OnInit {
  currentUser$: Observable<User | null>;
  showUserMenu = false;
  showMobileMenu = false;

  constructor(
    public authService: OAuthService,
    private cdr: ChangeDetectorRef
  ) {
    this.currentUser$ = this.authService.currentUser$;
    console.log('MainLayoutComponent initialized with OAuthService');
  }

  ngOnInit(): void {
    console.log('MainLayoutComponent ngOnInit');
    console.log('Is Authenticated:', this.authService.isAuthenticated());
    console.log('Current User:', this.authService.getCurrentUser());
    
    // Subscribe to user changes and trigger change detection
    this.currentUser$.subscribe(() => {
      // Use arrow function to maintain 'this' context
      if (this.cdr) {
        setTimeout(() => {
          try {
            this.cdr.detectChanges();
          } catch (e) {
            console.error('Error in change detection:', e);
          }
        }, 0);
      }
    });
  }

  toggleUserMenu(): void {
    this.showUserMenu = !this.showUserMenu;
  }

  toggleMobileMenu(): void {
    this.showMobileMenu = !this.showMobileMenu;
  }

  logout(): void {
    this.authService.logout();
    this.showUserMenu = false;
  }

  // Helper methods for template
  isAuthenticated(): boolean {
    return this.authService.isAuthenticated();
  }

  isLandlord(): boolean {
    return this.authService.hasRole('ROLE_LANDLORD');
  }

  isAdmin(): boolean {
    return this.authService.isAdmin();
  }
}
