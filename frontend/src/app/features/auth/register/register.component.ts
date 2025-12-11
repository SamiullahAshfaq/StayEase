import { Component, inject, signal } from '@angular/core';

import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/auth/auth.service';
import { OAuthService } from '../../../core/services/oauth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    RouterLink
],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private oauthService = inject(OAuthService);
  private router = inject(Router);

  registerForm: FormGroup;
  loading = signal(false);
  errorMessage = signal<string | null>(null);
  successMessage = signal<string | null>(null);
  isGmailAccount = signal(false);

  userTypeOptions = [
    { label: 'Find a Place (Tenant)', value: 'ROLE_TENANT' },
    { label: 'List My Property (Landlord)', value: 'ROLE_LANDLORD' }
  ];

  /**
   * Login with Google OAuth
   */
  loginWithGoogle(): void {
    this.loading.set(true);
    this.oauthService.loginWithGoogle();
  }

  /**
   * Login with Facebook OAuth
   */
  loginWithFacebook(): void {
    this.loading.set(true);
    this.oauthService.loginWithFacebook();
  }

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

  /**
   * Check if the email is a Gmail account
   */
  checkIfGmailAccount(email: string): void {
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

  passwordMatchValidator(group: FormGroup): { [key: string]: boolean } | null {
    const password = group.get('password')?.value;
    const confirmPassword = group.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { passwordMismatch: true };
  }

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

    const { userType, firstName, lastName, email, password } = this.registerForm.value;

    this.authService.register({
      email,
      password,
      firstName,
      lastName,
      role: userType
    } as any).subscribe({
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
