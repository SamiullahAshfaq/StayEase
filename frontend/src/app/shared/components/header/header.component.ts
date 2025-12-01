import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '@auth0/auth0-angular';
import { ButtonModule } from 'primeng/button';
import { AvatarModule } from 'primeng/avatar';
import { MenuModule } from 'primeng/menu';
import { MenuItem } from 'primeng/api';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink, ButtonModule, AvatarModule, MenuModule],
  template: `
    <header class="header">
      <div class="container">
        <div class="header-content">
          <a routerLink="/" class="logo">
            <i class="pi pi-home"></i>
            <span>StayEase</span>
          </a>
          
          <nav class="nav-links">
            <a routerLink="/listings" class="nav-link">Explore</a>
            <a routerLink="/create-listing" *ngIf="auth.isAuthenticated$ | async" class="nav-link">Host</a>
          </nav>
          
          <div class="auth-section">
            <ng-container *ngIf="auth.isAuthenticated$ | async; else loggedOut">
              <button pButton 
                      label="My Listings" 
                      icon="pi pi-list" 
                      class="p-button-text"
                      routerLink="/my-listings"></button>
              
              <p-avatar 
                [image]="(auth.user$ | async)?.picture" 
                shape="circle"
                (click)="menu.toggle($event)"
                styleClass="cursor-pointer"></p-avatar>
              
              <p-menu #menu [model]="menuItems" [popup]="true"></p-menu>
            </ng-container>
            
            <ng-template #loggedOut>
              <button pButton 
                      label="Log In" 
                      class="p-button-text"
                      (click)="auth.loginWithRedirect()"></button>
              <button pButton 
                      label="Sign Up" 
                      (click)="auth.loginWithRedirect({ authorizationParams: { screen_hint: 'signup' } })"></button>
            </ng-template>
          </div>
        </div>
      </div>
    </header>
  `,
  styles: [`
    .header {
      position: sticky;
      top: 0;
      z-index: 100;
      background: white;
      border-bottom: 1px solid var(--border-color);
      box-shadow: var(--shadow-sm);
    }
    
    .header-content {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 1rem 0;
      gap: 2rem;
    }
    
    .logo {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      font-size: 1.5rem;
      font-weight: 700;
      color: var(--primary-navy);
      text-decoration: none;
      transition: var(--transition-fast);
      
      i {
        font-size: 2rem;
        color: var(--accent-blue);
      }
      
      &:hover {
        color: var(--accent-blue);
      }
    }
    
    .nav-links {
      display: flex;
      gap: 2rem;
      flex: 1;
      justify-content: center;
    }
    
    .nav-link {
      color: var(--text-primary);
      text-decoration: none;
      font-weight: 500;
      transition: var(--transition-fast);
      position: relative;
      
      &::after {
        content: '';
        position: absolute;
        bottom: -4px;
        left: 0;
        width: 0;
        height: 2px;
        background: var(--accent-blue);
        transition: width 0.3s ease;
      }
      
      &:hover {
        color: var(--accent-blue);
        
        &::after {
          width: 100%;
        }
      }
    }
    
    .auth-section {
      display: flex;
      align-items: center;
      gap: 1rem;
    }
    
    ::ng-deep {
      .p-avatar {
        transition: var(--transition-fast);
        
        &:hover {
          transform: scale(1.05);
          box-shadow: var(--shadow-md);
        }
      }
    }
    
    @media (max-width: 768px) {
      .nav-links {
        display: none;
      }
      
      .logo span {
        display: none;
      }
    }
  `]
})
export class HeaderComponent {
  auth = inject(AuthService);
  router = inject(Router);
  
  menuItems: MenuItem[] = [
    {
      label: 'Profile',
      icon: 'pi pi-user',
      command: () => this.router.navigate(['/profile'])
    },
    {
      label: 'My Bookings',
      icon: 'pi pi-calendar',
      command: () => this.router.navigate(['/bookings'])
    },
    {
      separator: true
    },
    {
      label: 'Logout',
      icon: 'pi pi-sign-out',
      command: () => this.auth.logout({ logoutParams: { returnTo: window.location.origin } })
    }
  ];
}