// src/app/features/auth/register/register.component.ts
import { Component, inject, signal, OnInit, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/auth/auth.service';
import { AuthService as Auth0Service } from '@auth0/auth0-angular';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private auth0 = inject(Auth0Service, { optional: true });
  private router = inject(Router);
  private platformId = inject(PLATFORM_ID);

  registerForm: FormGroup;
  loading = signal(false);
  errorMessage = signal<string | null>(null);
  successMessage = signal<string | null>(null);
  isGmailAccount = signal(false);

  userTypeOptions = [
    { label: 'Find a Place (Tenant)', value: 'ROLE_TENANT' },
    { label: 'List My Property (Landlord)', value: 'ROLE_LANDLORD' },
    { label: 'Offer Services (Service Provider)', value: 'ROLE_SERVICE_PROVIDER' }
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

    // Watch for email changes to detect Gmail
    this.registerForm.get('email')?.valueChanges.subscribe(email => {
      this.checkIfGmailAccount(email);
    });
  }

  ngOnInit(): void {
    // Redirect if already authenticated
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/']);
    }
  }

  /**
   * Sign up with Google via Auth0
   */
  loginWithGoogle(): void {
    if (!isPlatformBrowser(this.platformId) || !this.auth0) {
      return;
    }
    this.loading.set(true);
    this.errorMessage.set(null);
    this.auth0.loginWithRedirect({
      authorizationParams: {
        connection: 'google-oauth2',
        screen_hint: 'signup'
      },
      appState: { target: '/' }
    });
  }

  /**
   * Sign up with Facebook via Auth0
   */
  loginWithFacebook(): void {
    if (!isPlatformBrowser(this.platformId) || !this.auth0) {
      return;
    }
    this.loading.set(true);
    this.errorMessage.set(null);
    this.auth0.loginWithRedirect({
      authorizationParams: {
        connection: 'facebook',
        screen_hint: 'signup'
      },
      appState: { target: '/' }
    });
  }

  /**
   * Check if the email is a Gmail account
   */
  checkIfGmailAccount(email: string): void {
    if (!email) {
      this.isGmailAccount.set(false);
      return;
    }

    const gmailDomains = ['@gmail.com', '@googlemail.com'];
    const isGmail = gmailDomains.some(domain => email.toLowerCase().endsWith(domain));
    this.isGmailAccount.set(isGmail);

    if (isGmail) {
      this.errorMessage.set('📧 Gmail detected! Please use "Continue with Google" button above for Gmail accounts.');
      // Disable password fields for Gmail accounts
      this.registerForm.get('password')?.disable();
      this.registerForm.get('confirmPassword')?.disable();
    } else {
      if (this.errorMessage()?.includes('Gmail detected')) {
        this.errorMessage.set(null);
      }
      // Re-enable password fields for non-Gmail accounts
      this.registerForm.get('password')?.enable();
      this.registerForm.get('confirmPassword')?.enable();
    }
  }

  /**
   * Password match validator
   */
  passwordMatchValidator(group: FormGroup): Record<string, boolean> | null {
    const password = group.get('password')?.value;
    const confirmPassword = group.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { passwordMismatch: true };
  }

  /**
   * Handle form submission
   */
  onSubmit(): void {
    // Prevent form submission for Gmail accounts
    if (this.isGmailAccount()) {
      this.errorMessage.set('⚠️ Gmail accounts must use "Continue with Google" button. Cannot register with password.');
      return;
    }

    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    this.errorMessage.set(null);
    this.successMessage.set(null);

    const { firstName, lastName, email, password, userType } = this.registerForm.value;

    // Call backend API with correct field names including userType
    this.authService.register({
      email,
      password,
      firstName,
      lastName,
      userType  // ✅ Now sending the selected role
    }).subscribe({
      next: (response) => {
        console.log('Registration successful:', response);
        this.loading.set(false);

        if (response.success) {
          this.successMessage.set('Account created successfully! Redirecting to complete your profile...');

          // Redirect to profile completion after 1 second
          setTimeout(() => {
            this.router.navigate(['/profile/complete']);
          }, 1000);
        }
      },
      error: (error) => {
        console.error('Registration error:', error);
        console.error('Error details:', {
          status: error.status,
          statusText: error.statusText,
          message: error.error?.message,
          error: error.error,
          url: error.url
        });
        this.loading.set(false);

        // Handle specific error messages
        let errorMsg = 'Failed to create account. Please try again.';

        if (error.error?.message) {
          errorMsg = error.error.message;
        } else if (error.status === 0) {
          errorMsg = 'Cannot connect to server. Please make sure the backend is running at http://localhost:8080';
        } else if (error.status === 409) {
          errorMsg = 'An account with this email already exists. Please login instead.';
        } else if (error.status === 400) {
          errorMsg = error.error?.message || 'Please check your input and try again.';
        } else if (error.status === 500) {
          errorMsg = 'Server error. Please try again later.';
        }

        this.errorMessage.set(errorMsg);
      }
    });
  }

  /**
   * Get form control validation errors
   */
  getFieldError(fieldName: string): string | null {
    const control = this.registerForm.get(fieldName);

    if (!control || !control.touched || !control.errors) {
      return null;
    }

    if (control.errors['required']) {
      return `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} is required`;
    }

    if (control.errors['email']) {
      return 'Please enter a valid email address';
    }

    if (control.errors['minlength']) {
      const minLength = control.errors['minlength'].requiredLength;
      return `Must be at least ${minLength} characters`;
    }

    if (control.errors['maxlength']) {
      const maxLength = control.errors['maxlength'].requiredLength;
      return `Must not exceed ${maxLength} characters`;
    }

    return null;
  }
}
