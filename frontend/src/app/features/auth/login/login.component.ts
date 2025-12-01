import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/auth/auth.service';

// PrimeNG Imports
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { CheckboxModule } from 'primeng/checkbox';
import { MessageModule } from 'primeng/message';
import { RippleModule } from 'primeng/ripple';
import { CardModule } from 'primeng/card';
import { DividerModule } from 'primeng/divider';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    ButtonModule,
    InputTextModule,
    PasswordModule,
    CheckboxModule,
    MessageModule,
    RippleModule,
    CardModule,
    DividerModule
  ],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-900 via-primary-800 to-primary-700 p-4">
      <!-- Animated Background Elements -->
      <div class="absolute inset-0 overflow-hidden pointer-events-none">
        <div class="absolute top-20 left-10 w-72 h-72 bg-accent-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div class="absolute bottom-20 right-10 w-96 h-96 bg-accent-400/10 rounded-full blur-3xl animate-pulse" style="animation-delay: 1s;"></div>
      </div>

      <!-- Login Card -->
      <div class="w-full max-w-md relative z-10 animate-fade-in">
        <div class="bg-white rounded-2xl shadow-2xl overflow-hidden">
          <!-- Header -->
          <div class="bg-gradient-to-r from-primary-600 to-primary-500 p-8 text-white text-center">
            <div class="mb-4 animate-scale-in">
              <i class="pi pi-home text-5xl"></i>
            </div>
            <h1 class="text-3xl font-bold mb-2">Welcome Back</h1>
            <p class="text-primary-100">Sign in to continue to StayEase</p>
          </div>

          <!-- Form -->
          <div class="p-8">
            @if (errorMessage()) {
              <p-message 
                severity="error" 
                [text]="errorMessage()!" 
                styleClass="w-full mb-4 animate-slide-in"
              />
            }

            <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" class="space-y-6">
              <!-- Email Field -->
              <div class="animate-slide-up" style="animation-delay: 0.1s;">
                <label for="email" class="block text-sm font-semibold text-gray-700 mb-2">
                  Email Address
                </label>
                <div class="relative">
                  <span class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                    <i class="pi pi-envelope"></i>
                  </span>
                  <input 
                    pInputText 
                    id="email" 
                    formControlName="email"
                    type="email"
                    placeholder="Enter your email"
                    class="w-full pl-10 pr-4 py-3 border-2 rounded-lg transition-all duration-300
                           focus:border-accent-500 focus:ring-4 focus:ring-accent-100
                           hover:border-gray-400"
                    [class.border-red-500]="loginForm.get('email')?.invalid && loginForm.get('email')?.touched"
                  />
                </div>
                @if (loginForm.get('email')?.invalid && loginForm.get('email')?.touched) {
                  <small class="text-red-500 mt-1 block animate-slide-in">
                    @if (loginForm.get('email')?.errors?.['required']) {
                      Email is required
                    } @else if (loginForm.get('email')?.errors?.['email']) {
                      Please enter a valid email
                    }
                  </small>
                }
              </div>

              <!-- Password Field -->
              <div class="animate-slide-up" style="animation-delay: 0.2s;">
                <label for="password" class="block text-sm font-semibold text-gray-700 mb-2">
                  Password
                </label>
                <div class="relative">
                  <span class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 z-10">
                    <i class="pi pi-lock"></i>
                  </span>
                  <p-password 
                    formControlName="password"
                    [toggleMask]="true"
                    [feedback]="false"
                    placeholder="Enter your password"
                    styleClass="w-full"
                    inputStyleClass="w-full pl-10 pr-12 py-3 border-2 rounded-lg transition-all duration-300
                                    focus:border-accent-500 focus:ring-4 focus:ring-accent-100
                                    hover:border-gray-400"
                    [class.border-red-500]="loginForm.get('password')?.invalid && loginForm.get('password')?.touched"
                  />
                </div>
                @if (loginForm.get('password')?.invalid && loginForm.get('password')?.touched) {
                  <small class="text-red-500 mt-1 block animate-slide-in">
                    Password is required
                  </small>
                }
              </div>

              <!-- Remember Me & Forgot Password -->
              <div class="flex items-center justify-between animate-slide-up" style="animation-delay: 0.3s;">
                <div class="flex items-center">
                  <p-checkbox 
                    formControlName="rememberMe"
                    [binary]="true"
                    inputId="rememberMe"
                  />
                  <label for="rememberMe" class="ml-2 text-sm text-gray-600 cursor-pointer">
                    Remember me
                  </label>
                </div>
                <a 
                  routerLink="/forgot-password" 
                  class="text-sm text-accent-600 hover:text-accent-700 font-medium transition-colors"
                >
                  Forgot password?
                </a>
              </div>

              <!-- Submit Button -->
              <button
                pButton
                pRipple
                type="submit"
                label="Sign In"
                icon="pi pi-sign-in"
                [loading]="loading()"
                [disabled]="loginForm.invalid"
                class="w-full py-3 bg-gradient-to-r from-primary-600 to-primary-500 
                       hover:from-primary-700 hover:to-primary-600
                       text-white font-semibold rounded-lg shadow-lg
                       transform transition-all duration-300
                       hover:scale-[1.02] hover:shadow-xl
                       disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
                       animate-slide-up"
                style="animation-delay: 0.4s;"
              ></button>
            </form>

            <!-- Divider -->
            <div class="my-6 animate-fade-in" style="animation-delay: 0.5s;">
              <p-divider align="center">
                <span class="text-gray-500 text-sm">OR</span>
              </p-divider>
            </div>

            <!-- Sign Up Link -->
            <div class="text-center animate-slide-up" style="animation-delay: 0.6s;">
              <p class="text-gray-600">
                Don't have an account?
                <a 
                  routerLink="/register" 
                  class="text-accent-600 hover:text-accent-700 font-semibold ml-1 transition-colors"
                >
                  Sign up now
                </a>
              </p>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div class="text-center mt-6 text-white/80 text-sm animate-fade-in" style="animation-delay: 0.7s;">
          <p>© 2025 StayEase. All rights reserved.</p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host ::ng-deep {
      .p-password {
        width: 100%;
      }
      
      .p-password-input {
        width: 100%;
      }

      .p-checkbox .p-checkbox-box {
        border-width: 2px;
        transition: all 0.3s;
      }

      .p-checkbox .p-checkbox-box.p-highlight {
        background: #1a2332;
        border-color: #1a2332;
      }

      .p-checkbox:not(.p-checkbox-disabled) .p-checkbox-box:hover {
        border-color: #1a2332;
      }

      .p-message {
        border-radius: 0.5rem;
      }
    }
  `]
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  loginForm: FormGroup;
  loading = signal(false);
  errorMessage = signal<string | null>(null);

  constructor() {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]],
      rememberMe: [false]
    });
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      return;
    }

    this.loading.set(true);
    this.errorMessage.set(null);

    const { email, password } = this.loginForm.value;

    this.authService.login({ email, password }).subscribe({
      next: (response) => {
        this.loading.set(false);
        // Navigate based on user role
        const user = response.data?.user;
        if (user?.authorities?.includes('ROLE_LANDLORD')) {
          this.router.navigate(['/my-listings']);
        } else {
          this.router.navigate(['/listings']);
        }
      },
      error: (error) => {
        this.loading.set(false);
        this.errorMessage.set(
          error.error?.message || 'Invalid email or password. Please try again.'
        );
      }
    });
  }
}
