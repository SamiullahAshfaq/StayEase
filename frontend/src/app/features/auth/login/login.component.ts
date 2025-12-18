// src/app/features/auth/login/login.component.ts
import { Component, inject, OnInit, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../core/auth/auth.service';
import { AuthService as Auth0Service } from '@auth0/auth0-angular';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  loading = false;
  error: string | null = null;
  showPassword = false;
  returnUrl = '/';

  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private auth0 = inject(Auth0Service, { optional: true });
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private platformId = inject(PLATFORM_ID);

  constructor() {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      rememberMe: [false]
    });
  }

  ngOnInit(): void {
    // Get return URL from query params or default to '/'
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';

    // Show error message if redirected due to session expiry
    const errorParam = this.route.snapshot.queryParams['error'];
    if (errorParam) {
      this.error = errorParam;
    }

    // If already authenticated, redirect
    if (this.authService.isAuthenticated()) {
      this.navigateAfterLogin();
    }
  }

  /**
   * Login with Auth0 (supports Google, Facebook, etc.)
   */
  loginWithAuth0(): void {
    if (!isPlatformBrowser(this.platformId) || !this.auth0) {
      return;
    }
    this.loading = true;
    this.error = null;
    this.auth0.loginWithRedirect({
      appState: { target: this.returnUrl }
    });
  }

  /**
   * Login with Google via Auth0
   */
  loginWithGoogle(): void {
    if (!isPlatformBrowser(this.platformId) || !this.auth0) {
      return;
    }
    this.loading = true;
    this.error = null;
    this.auth0.loginWithRedirect({
      authorizationParams: {
        connection: 'google-oauth2'
      },
      appState: { target: this.returnUrl }
    });
  }

  /**
   * Login with Facebook via Auth0
   */
  loginWithFacebook(): void {
    if (!isPlatformBrowser(this.platformId) || !this.auth0) {
      return;
    }
    this.loading = true;
    this.error = null;
    this.auth0.loginWithRedirect({
      authorizationParams: {
        connection: 'facebook'
      },
      appState: { target: this.returnUrl }
    });
  }

  /**
   * Handle form submission
   */
  onSubmit(): void {
    if (this.loginForm.invalid) {
      Object.keys(this.loginForm.controls).forEach(key => {
        this.loginForm.get(key)?.markAsTouched();
      });
      return;
    }

    this.loading = true;
    this.error = null;

    const { email, password } = this.loginForm.value;

    this.authService.login({ email, password }).subscribe({
      next: (response) => {
        console.log('Login successful:', response);
        this.loading = false;

        if (response.success) {
          this.navigateAfterLogin();
        }
      },
      error: (error) => {
        console.error('Login error:', error);
        this.loading = false;
        this.error = error.error?.message || 'Invalid email or password. Please try again.';

        // Add shake animation to form
        this.loginForm.setErrors({ invalidCredentials: true });
      }
    });
  }

  /**
   * Navigate after successful login based on profile completion and role
   */
  private navigateAfterLogin(): void {
    const user = this.authService.getCurrentUser();

    if (!user) {
      this.error = 'Failed to load user data';
      return;
    }

    // Check if profile is complete
    if (!this.authService.isProfileComplete()) {
      this.router.navigate(['/profile/complete']);
      return;
    }

    // Navigate based on role
    if (user.authorities.includes('ROLE_ADMIN')) {
      this.router.navigate(['/admin/dashboard']);
    } else if (user.authorities.includes('ROLE_LANDLORD')) {
      this.router.navigate(['/profile/my-listings']); // Fixed: Navigate to my listings instead
    } else if (this.returnUrl !== '/') {
      this.router.navigateByUrl(this.returnUrl);
    } else {
      this.router.navigate(['/']);
    }
  }

  /**
   * Toggle password visibility
   */
  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  /**
   * Get form control error message
   */
  getErrorMessage(field: string): string {
    const control = this.loginForm.get(field);

    if (control?.hasError('required')) {
      return `${field.charAt(0).toUpperCase() + field.slice(1)} is required`;
    }

    if (control?.hasError('email')) {
      return 'Please enter a valid email address';
    }

    if (control?.hasError('minlength')) {
      const minLength = control.errors?.['minlength'].requiredLength;
      return `Password must be at least ${minLength} characters`;
    }

    return '';
  }
}
