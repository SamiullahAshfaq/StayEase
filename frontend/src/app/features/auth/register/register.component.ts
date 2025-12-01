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
import { SelectButtonModule } from 'primeng/selectbutton';

@Component({
  selector: 'app-register',
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
    DividerModule,
    SelectButtonModule
  ],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-900 via-primary-800 to-primary-700 p-4 py-12">
      <div class="absolute inset-0 overflow-hidden pointer-events-none">
        <div class="absolute top-10 right-20 w-72 h-72 bg-accent-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div class="absolute bottom-10 left-20 w-96 h-96 bg-accent-400/10 rounded-full blur-3xl animate-pulse" style="animation-delay: 1s;"></div>
      </div>

      <div class="w-full max-w-2xl relative z-10 animate-fade-in">
        <div class="bg-white rounded-2xl shadow-2xl overflow-hidden">
          <div class="bg-gradient-to-r from-primary-600 to-primary-500 p-8 text-white text-center">
            <div class="mb-4 animate-scale-in">
              <i class="pi pi-user-plus text-5xl"></i>
            </div>
            <h1 class="text-3xl font-bold mb-2">Create Account</h1>
            <p class="text-primary-100">Join StayEase and start your journey</p>
          </div>

          <div class="p-8">
            @if (errorMessage()) {
              <p-message 
                severity="error" 
                [text]="errorMessage()!" 
                styleClass="w-full mb-4 animate-slide-in"
              />
            }

            @if (successMessage()) {
              <p-message 
                severity="success" 
                [text]="successMessage()!" 
                styleClass="w-full mb-4 animate-slide-in"
              />
            }

            <form [formGroup]="registerForm" (ngSubmit)="onSubmit()" class="space-y-5">
              <div class="animate-slide-up" style="animation-delay: 0.1s;">
                <label class="block text-sm font-semibold text-gray-700 mb-3">I want to</label>
                <p-selectButton 
                  formControlName="userType"
                  [options]="userTypeOptions"
                  optionLabel="label"
                  optionValue="value"
                  styleClass="w-full grid grid-cols-2 gap-3"
                />
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="animate-slide-up" style="animation-delay: 0.2s;">
                  <label for="firstName" class="block text-sm font-semibold text-gray-700 mb-2">First Name</label>
                  <div class="relative">
                    <span class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                      <i class="pi pi-user"></i>
                    </span>
                    <input 
                      pInputText 
                      id="firstName" 
                      formControlName="firstName"
                      placeholder="John"
                      class="w-full pl-10 pr-4 py-3 border-2 rounded-lg transition-all duration-300
                             focus:border-accent-500 focus:ring-4 focus:ring-accent-100 hover:border-gray-400"
                      [class.border-red-500]="registerForm.get('firstName')?.invalid && registerForm.get('firstName')?.touched"
                    />
                  </div>
                  @if (registerForm.get('firstName')?.invalid && registerForm.get('firstName')?.touched) {
                    <small class="text-red-500 mt-1 block animate-slide-in">First name is required</small>
                  }
                </div>

                <div class="animate-slide-up" style="animation-delay: 0.3s;">
                  <label for="lastName" class="block text-sm font-semibold text-gray-700 mb-2">Last Name</label>
                  <div class="relative">
                    <span class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                      <i class="pi pi-user"></i>
                    </span>
                    <input 
                      pInputText 
                      id="lastName" 
                      formControlName="lastName"
                      placeholder="Doe"
                      class="w-full pl-10 pr-4 py-3 border-2 rounded-lg transition-all duration-300
                             focus:border-accent-500 focus:ring-4 focus:ring-accent-100 hover:border-gray-400"
                      [class.border-red-500]="registerForm.get('lastName')?.invalid && registerForm.get('lastName')?.touched"
                    />
                  </div>
                  @if (registerForm.get('lastName')?.invalid && registerForm.get('lastName')?.touched) {
                    <small class="text-red-500 mt-1 block animate-slide-in">Last name is required</small>
                  }
                </div>
              </div>

              <div class="animate-slide-up" style="animation-delay: 0.4s;">
                <label for="email" class="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
                <div class="relative">
                  <span class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                    <i class="pi pi-envelope"></i>
                  </span>
                  <input 
                    pInputText 
                    id="email" 
                    formControlName="email"
                    type="email"
                    placeholder="john.doe@example.com"
                    class="w-full pl-10 pr-4 py-3 border-2 rounded-lg transition-all duration-300
                           focus:border-accent-500 focus:ring-4 focus:ring-accent-100 hover:border-gray-400"
                    [class.border-red-500]="registerForm.get('email')?.invalid && registerForm.get('email')?.touched"
                  />
                </div>
                @if (registerForm.get('email')?.invalid && registerForm.get('email')?.touched) {
                  <small class="text-red-500 mt-1 block animate-slide-in">
                    @if (registerForm.get('email')?.errors?.['required']) {
                      Email is required
                    } @else if (registerForm.get('email')?.errors?.['email']) {
                      Please enter a valid email
                    }
                  </small>
                }
              </div>

              <div class="animate-slide-up" style="animation-delay: 0.5s;">
                <label for="password" class="block text-sm font-semibold text-gray-700 mb-2">Password</label>
                <div class="relative">
                  <span class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 z-10">
                    <i class="pi pi-lock"></i>
                  </span>
                  <p-password 
                    formControlName="password"
                    [toggleMask]="true"
                    placeholder="Create a strong password"
                    [feedback]="true"
                    weakLabel="Weak"
                    mediumLabel="Medium"
                    strongLabel="Strong"
                    styleClass="w-full"
                    inputStyleClass="w-full pl-10 pr-12 py-3 border-2 rounded-lg transition-all duration-300
                                    focus:border-accent-500 focus:ring-4 focus:ring-accent-100 hover:border-gray-400"
                    [class.border-red-500]="registerForm.get('password')?.invalid && registerForm.get('password')?.touched"
                  />
                </div>
                @if (registerForm.get('password')?.invalid && registerForm.get('password')?.touched) {
                  <small class="text-red-500 mt-1 block animate-slide-in">
                    @if (registerForm.get('password')?.errors?.['required']) {
                      Password is required
                    } @else if (registerForm.get('password')?.errors?.['minlength']) {
                      Password must be at least 8 characters
                    }
                  </small>
                }
              </div>

              <div class="animate-slide-up" style="animation-delay: 0.6s;">
                <label for="confirmPassword" class="block text-sm font-semibold text-gray-700 mb-2">Confirm Password</label>
                <div class="relative">
                  <span class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 z-10">
                    <i class="pi pi-lock"></i>
                  </span>
                  <p-password 
                    formControlName="confirmPassword"
                    [toggleMask]="true"
                    [feedback]="false"
                    placeholder="Re-enter your password"
                    styleClass="w-full"
                    inputStyleClass="w-full pl-10 pr-12 py-3 border-2 rounded-lg transition-all duration-300
                                    focus:border-accent-500 focus:ring-4 focus:ring-accent-100 hover:border-gray-400"
                    [class.border-red-500]="registerForm.get('confirmPassword')?.invalid && registerForm.get('confirmPassword')?.touched"
                  />
                </div>
                @if (registerForm.get('confirmPassword')?.invalid && registerForm.get('confirmPassword')?.touched) {
                  <small class="text-red-500 mt-1 block animate-slide-in">
                    @if (registerForm.get('confirmPassword')?.errors?.['required']) {
                      Please confirm your password
                    }
                  </small>
                }
                @if (registerForm.errors?.['passwordMismatch'] && registerForm.get('confirmPassword')?.touched) {
                  <small class="text-red-500 mt-1 block animate-slide-in">Passwords do not match</small>
                }
              </div>

              <div class="flex items-start animate-slide-up" style="animation-delay: 0.7s;">
                <p-checkbox 
                  formControlName="acceptTerms"
                  [binary]="true"
                  inputId="acceptTerms"
                />
                <label for="acceptTerms" class="ml-2 text-sm text-gray-600 cursor-pointer">
                  I agree to the 
                  <a href="#" class="text-accent-600 hover:text-accent-700 font-medium">Terms of Service</a> 
                  and 
                  <a href="#" class="text-accent-600 hover:text-accent-700 font-medium">Privacy Policy</a>
                </label>
              </div>
              @if (registerForm.get('acceptTerms')?.invalid && registerForm.get('acceptTerms')?.touched) {
                <small class="text-red-500 block animate-slide-in">You must accept the terms and conditions</small>
              }

              <button
                pButton
                pRipple
                type="submit"
                label="Create Account"
                icon="pi pi-user-plus"
                [loading]="loading()"
                [disabled]="registerForm.invalid"
                class="w-full py-3 bg-gradient-to-r from-primary-600 to-primary-500 
                       hover:from-primary-700 hover:to-primary-600 text-white font-semibold rounded-lg shadow-lg
                       transform transition-all duration-300 hover:scale-[1.02] hover:shadow-xl
                       disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none animate-slide-up"
                style="animation-delay: 0.8s;"
              ></button>
            </form>

            <div class="my-6 animate-fade-in" style="animation-delay: 0.9s;">
              <p-divider align="center">
                <span class="text-gray-500 text-sm">OR</span>
              </p-divider>
            </div>

            <div class="text-center animate-slide-up" style="animation-delay: 1s;">
              <p class="text-gray-600">
                Already have an account?
                <a routerLink="/login" class="text-accent-600 hover:text-accent-700 font-semibold ml-1 transition-colors">
                  Sign in here
                </a>
              </p>
            </div>
          </div>
        </div>

        <div class="text-center mt-6 text-white/80 text-sm animate-fade-in" style="animation-delay: 1.1s;">
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

      .p-selectbutton {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 0.75rem;

        .p-button {
          border-width: 2px;
          border-color: #e5e7eb;
          background: white;
          color: #4b5563;
          transition: all 0.3s;
          padding: 1rem;
          font-weight: 600;

          &:hover {
            border-color: #1a2332;
            background: #f9fafb;
          }

          &.p-highlight {
            background: linear-gradient(135deg, #1a2332 0%, #2a3647 100%);
            border-color: #1a2332;
            color: white;
            box-shadow: 0 4px 6px -1px rgba(26, 35, 50, 0.2);

            &:hover {
              background: linear-gradient(135deg, #0f1821 0%, #1a2332 100%);
            }
          }
        }
      }

      .p-checkbox .p-checkbox-box {
        border-width: 2px;
        transition: all 0.3s;
      }

      .p-checkbox .p-checkbox-box.p-highlight {
        background: #1a2332;
        border-color: #1a2332;
      }

      .p-password-panel {
        margin-top: 0.5rem;
      }

      .p-message {
        border-radius: 0.5rem;
      }
    }
  `]
})
export class RegisterComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  registerForm: FormGroup;
  loading = signal(false);
  errorMessage = signal<string | null>(null);
  successMessage = signal<string | null>(null);

  userTypeOptions = [
    { label: 'Find a Place (Tenant)', value: 'ROLE_TENANT', icon: 'pi pi-search' },
    { label: 'List My Property (Landlord)', value: 'ROLE_LANDLORD', icon: 'pi pi-home' }
  ];

  constructor() {
    this.registerForm = this.fb.group({
      userType: ['ROLE_TENANT', Validators.required],
      firstName: ['', [Validators.required, Validators.minLength(1), Validators.maxLength(100)]],
      lastName: ['', [Validators.required, Validators.minLength(1), Validators.maxLength(100)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', [Validators.required]],
      acceptTerms: [false, [Validators.requiredTrue]]
    }, { validators: this.passwordMatchValidator });
  }

  passwordMatchValidator(group: FormGroup): { [key: string]: boolean } | null {
    const password = group.get('password')?.value;
    const confirmPassword = group.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { passwordMismatch: true };
  }

  onSubmit(): void {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    this.errorMessage.set(null);
    this.successMessage.set(null);

    const { userType, firstName, lastName, email, password } = this.registerForm.value;

    this.authService.register({
      email,
      password,
      firstName,
      lastName,
      authorities: [userType]
    }).subscribe({
      next: () => {
        this.loading.set(false);
        this.successMessage.set('Account created successfully! Redirecting to login...');
        
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 2000);
      },
      error: (error) => {
        this.loading.set(false);
        this.errorMessage.set(
          error.error?.message || 'Failed to create account. Please try again.'
        );
      }
    });
  }
}
