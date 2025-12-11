import { Component } from '@angular/core';

import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/auth/auth.service';
import { OAuthService } from '../../../core/services/oauth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, RouterModule],
  templateUrl: './login.component.html'
})
export class LoginComponent {
  loginForm: FormGroup;
  loading = false;
  error: string | null = null;
  showPassword = false;
  isGmailAccount = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private oauthService: OAuthService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]],
      rememberMe: [false]
    });

    // Watch for email changes to detect Gmail
    this.loginForm.get('email')?.valueChanges.subscribe(email => {
      this.checkIfGmailAccount(email);
    });
  }

  /**
   * Check if the email is a Gmail account
   */
  checkIfGmailAccount(email: string): void {
    const gmailDomains = ['@gmail.com', '@googlemail.com'];
    this.isGmailAccount = gmailDomains.some(domain => email.toLowerCase().endsWith(domain));
    
    if (this.isGmailAccount) {
      this.error = '📧 Gmail detected! Please use "Continue with Google" button above for Gmail accounts.';
      // Disable password field for Gmail accounts
      this.loginForm.get('password')?.disable();
    } else {
      if (this.error?.includes('Gmail detected')) {
        this.error = null;
      }
      // Re-enable password field for non-Gmail accounts
      this.loginForm.get('password')?.enable();
    }
  }

  /**
   * Login with Google OAuth
   */
  loginWithGoogle(): void {
    this.loading = true;
    this.oauthService.loginWithGoogle();
  }

  /**
   * Login with Facebook OAuth
   */
  loginWithFacebook(): void {
    this.loading = true;
    this.oauthService.loginWithFacebook();
  }

  onSubmit(): void {
    // Prevent form submission for Gmail accounts
    if (this.isGmailAccount) {
      this.error = '⚠️ Gmail accounts must use "Continue with Google" button. Cannot login with password.';
      return;
    }

    if (this.loginForm.invalid) {
      Object.keys(this.loginForm.controls).forEach(key => {
        this.loginForm.get(key)?.markAsTouched();
      });
      return;
    }

    this.loading = true;
    this.error = null;

    this.authService.login(this.loginForm.value).subscribe({
      next: (response) => {
        if (response.success) {
          this.router.navigate(['/']);
        }
        this.loading = false;
      },
      error: (error) => {
        this.error = error.error?.message || 'Invalid email or password';
        this.loading = false;
      }
    });
  }

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  getErrorMessage(field: string): string {
    const control = this.loginForm.get(field);
    if (control?.hasError('required')) {
      return `${field.charAt(0).toUpperCase() + field.slice(1)} is required`;
    }
    if (control?.hasError('email')) {
      return 'Please enter a valid email address';
    }
    return '';
  }
}