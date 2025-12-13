// src/app/features/auth/forgot-password/forgot-password.component.ts

import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AuthService } from '../../../core/auth/auth.service';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule
  ],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
      <div class="max-w-md w-full">
        <div class="text-center mb-8">
          <h1 class="text-4xl font-bold mb-2" style="color: #005461;">StayEase</h1>
          <p class="text-gray-600">
            {{ emailSent ? 'Check your email' : 'Reset your password' }}
          </p>
        </div>

        <div class="bg-white rounded-lg shadow-lg p-8">
          <div *ngIf="!emailSent">
            <p class="text-gray-600 mb-6">
              Enter your email address and we'll send you a link to reset your password.
            </p>

            <form [formGroup]="forgotPasswordForm" (ngSubmit)="onSubmit()">
              <mat-form-field class="w-full mb-6" appearance="outline">
                <mat-label>Email</mat-label>
                <input matInput type="email" formControlName="email" placeholder="Enter your email">
                <mat-icon matPrefix class="mr-2" style="color: #018790;">email</mat-icon>
                <mat-error *ngIf="forgotPasswordForm.get('email')?.invalid">
                  Please enter a valid email
                </mat-error>
              </mat-form-field>

              <button mat-raised-button
                      type="submit"
                      class="w-full h-12 text-white font-semibold rounded-lg mb-4"
                      style="background-color: #018790;"
                      [disabled]="loading || forgotPasswordForm.invalid">
                <span *ngIf="!loading">Send Reset Link</span>
                <mat-spinner *ngIf="loading" diameter="24" class="mx-auto"></mat-spinner>
              </button>
            </form>
          </div>

          <div *ngIf="emailSent" class="text-center">
            <mat-icon class="text-6xl mb-4" style="color: #018790;">mark_email_read</mat-icon>
            <p class="text-gray-600 mb-6">
              We've sent a password reset link to <strong>{{ forgotPasswordForm.get('email')?.value }}</strong>
            </p>
            <p class="text-sm text-gray-500 mb-6">
              Didn't receive the email? Check your spam folder or
              <button type="button"
                      (click)="resendEmail()"
                      class="text-[#018790] hover:underline font-semibold">
                resend
              </button>
            </p>
          </div>

          <div class="text-center">
            <a routerLink="/auth/login"
               class="text-sm hover:underline"
               style="color: #018790;">
              <mat-icon class="align-middle text-sm">arrow_back</mat-icon>
              Back to login
            </a>
          </div>
        </div>
      </div>
    </div>
  `
})
export class ForgotPasswordComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private snackBar = inject(MatSnackBar);

  forgotPasswordForm: FormGroup;
  loading = false;
  emailSent = false;

  constructor() {
    this.forgotPasswordForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  onSubmit(): void {
    if (this.forgotPasswordForm.invalid) {
      return;
    }

    this.loading = true;
    this.authService.forgotPassword(this.forgotPasswordForm.value).subscribe({
      next: () => {
        this.loading = false;
        this.emailSent = true;
      },
      error: (error) => {
        this.loading = false;
        const message = error.error?.message || 'Failed to send reset email';
        this.snackBar.open(message, 'Close', { duration: 5000 });
      }
    });
  }

  resendEmail(): void {
    this.emailSent = false;
    this.onSubmit();
  }
}
