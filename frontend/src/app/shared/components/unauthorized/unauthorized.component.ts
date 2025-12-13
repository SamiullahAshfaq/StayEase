// src/app/shared/components/unauthorized/unauthorized.component.ts
import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../core/auth/auth.service';

@Component({
  selector: 'app-unauthorized',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="min-h-screen bg-[#F4F4F4] flex items-center justify-center p-4">
      <div class="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
        <div class="mb-6">
          <svg class="w-24 h-24 mx-auto text-[#018790]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
          </svg>
        </div>
        <h1 class="text-3xl font-bold text-[#005461] mb-4">Access Denied</h1>
        <p class="text-gray-600 mb-8">
          You don't have permission to access this page. Please contact your administrator if you believe this is an error.
        </p>
        <a routerLink="/"
           class="inline-block px-6 py-3 bg-gradient-to-r from-[#005461] to-[#018790] text-white font-semibold rounded-lg hover:shadow-lg transition-all duration-300">
          Go to Homepage
        </a>
      </div>
    </div>
  `
})
export class UnauthorizedComponent {}

// src/app/shared/components/not-found/not-found.component.ts
@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="min-h-screen bg-[#F4F4F4] flex items-center justify-center p-4">
      <div class="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
        <div class="mb-6">
          <h1 class="text-9xl font-bold text-[#00B7B5]">404</h1>
        </div>
        <h2 class="text-3xl font-bold text-[#005461] mb-4">Page Not Found</h2>
        <p class="text-gray-600 mb-8">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <a routerLink="/"
           class="inline-block px-6 py-3 bg-gradient-to-r from-[#005461] to-[#018790] text-white font-semibold rounded-lg hover:shadow-lg transition-all duration-300">
          Go to Homepage
        </a>
      </div>
    </div>
  `
})
export class NotFoundComponent {}

// src/app/features/home/home.component.ts
@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="min-h-screen bg-[#F4F4F4]">
      <!-- Hero Section -->
      <div class="bg-gradient-to-r from-[#005461] to-[#018790] text-white">
        <div class="container mx-auto px-4 py-20">
          <div class="max-w-3xl mx-auto text-center">
            <h1 class="text-5xl font-bold mb-6 animate-fade-in">
              Find Your Perfect Stay
            </h1>
            <p class="text-xl mb-8 text-[#00B7B5]">
              Discover unique homes and experiences around the world
            </p>
            <div class="flex gap-4 justify-center">
              <a routerLink="/listings"
                 class="px-8 py-4 bg-white text-[#005461] font-semibold rounded-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                Explore Listings
              </a>
              @if (!isAuthenticated()) {
                <a routerLink="/auth/register"
                   class="px-8 py-4 border-2 border-white text-white font-semibold rounded-lg hover:bg-white hover:text-[#005461] transition-all duration-300">
                  Get Started
                </a>
              }
            </div>
          </div>
        </div>
      </div>

      <!-- Features -->
      <div class="container mx-auto px-4 py-16">
        <div class="grid md:grid-cols-3 gap-8">
          <div class="bg-white p-8 rounded-xl shadow-lg text-center">
            <div class="w-16 h-16 bg-[#00B7B5] rounded-full mx-auto mb-4 flex items-center justify-center">
              <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
              </svg>
            </div>
            <h3 class="text-xl font-bold text-[#005461] mb-2">Unique Properties</h3>
            <p class="text-gray-600">Find the perfect place for your next adventure</p>
          </div>

          <div class="bg-white p-8 rounded-xl shadow-lg text-center">
            <div class="w-16 h-16 bg-[#018790] rounded-full mx-auto mb-4 flex items-center justify-center">
              <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
              </svg>
            </div>
            <h3 class="text-xl font-bold text-[#005461] mb-2">Secure Booking</h3>
            <p class="text-gray-600">Book with confidence on our secure platform</p>
          </div>

          <div class="bg-white p-8 rounded-xl shadow-lg text-center">
            <div class="w-16 h-16 bg-[#005461] rounded-full mx-auto mb-4 flex items-center justify-center">
              <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
              </svg>
            </div>
            <h3 class="text-xl font-bold text-[#005461] mb-2">24/7 Support</h3>
            <p class="text-gray-600">Get help whenever you need it</p>
          </div>
        </div>
      </div>
    </div>
  `
})
export class HomeComponent {
  private authService = inject(AuthService);

  isAuthenticated(): boolean {
    return this.authService.isAuthenticated();
  }
}
