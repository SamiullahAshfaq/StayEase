// src/app/features/profile/profile-complete/profile-complete.component.ts
import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../core/auth/auth.service';
import { ProfileService } from '../../core/services/profile.service';

@Component({
  selector: 'app-profile-complete',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="min-h-screen bg-[#F4F4F4] flex items-center justify-center p-4">
      <div class="max-w-2xl w-full bg-white rounded-2xl shadow-2xl overflow-hidden animate-fade-in">
        <!-- Header -->
        <div class="bg-gradient-to-r from-[#005461] to-[#018790] p-8 text-white">
          <h1 class="text-3xl font-bold mb-2">Complete Your Profile</h1>
          <p class="text-[#00B7B5]">Just a few more details to get started</p>
        </div>

        <!-- Progress Bar -->
        <div class="bg-gray-200 h-2">
          <div class="bg-[#00B7B5] h-2 transition-all duration-500"
               [style.width.%]="getProgress()"></div>
        </div>

        <!-- Form -->
        <form [formGroup]="profileForm" (ngSubmit)="onSubmit()" class="p-8 space-y-6">
          <!-- Profile Image Upload -->
          <div class="text-center">
            <label for="profile-image" class="block text-sm font-semibold text-[#005461] mb-4">
              Profile Picture
            </label>
            <div class="flex justify-center mb-4">
              <div class="relative group">
                <div class="w-32 h-32 rounded-full overflow-hidden border-4 border-[#00B7B5] shadow-lg transition-transform duration-300 group-hover:scale-105">
                  @if (previewUrl()) {
                    <img [src]="previewUrl()" alt="Profile" class="w-full h-full object-cover">
                  } @else {
                    <div class="w-full h-full bg-gradient-to-br from-[#005461] to-[#018790] flex items-center justify-center">
                      <svg class="w-16 h-16 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd"/>
                      </svg>
                    </div>
                  }
                </div>
                <label class="absolute bottom-0 right-0 bg-[#00B7B5] rounded-full p-3 cursor-pointer shadow-lg hover:bg-[#018790] transition-colors duration-300">
                  <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"/>
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"/>
                  </svg>
                  <input id="profile-image"
                         type="file"
                         class="hidden"
                         accept="image/*"
                         (change)="onFileSelected($event)">
                </label>
              </div>
            </div>
            @if (uploadError()) {
              <p class="text-red-500 text-sm mt-2">{{ uploadError() }}</p>
            }
          </div>

          <!-- Phone Number -->
          <div>
            <label for="phoneNumber" class="block text-sm font-semibold text-[#005461] mb-2">
              Phone Number *
            </label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
                </svg>
              </div>
              <input id="phoneNumber"
                     type="tel"
                     formControlName="phoneNumber"
                     placeholder="+1 (555) 000-0000"
                     class="w-full pl-12 pr-4 py-3.5 border-2 border-[#00B7B5] rounded-xl focus:ring-2 focus:ring-[#018790] focus:border-transparent transition-all duration-200 text-[#005461]"
                     [class.border-red-500]="profileForm.get('phoneNumber')?.invalid && profileForm.get('phoneNumber')?.touched">
            </div>
            @if (profileForm.get('phoneNumber')?.invalid && profileForm.get('phoneNumber')?.touched) {
              <p class="text-red-500 text-sm mt-1">
                @if (profileForm.get('phoneNumber')?.errors?.['required']) {
                  Phone number is required
                }
                @if (profileForm.get('phoneNumber')?.errors?.['pattern']) {
                  Please enter a valid phone number
                }
              </p>
            }
          </div>

          <!-- Bio -->
          <div>
            <label for="bio" class="block text-sm font-semibold text-[#005461] mb-2">
              About You *
            </label>
            <textarea id="bio"
                      formControlName="bio"
                      rows="4"
                      placeholder="Tell us a bit about yourself..."
                      class="w-full px-4 py-3.5 border-2 border-[#00B7B5] rounded-xl focus:ring-2 focus:ring-[#018790] focus:border-transparent transition-all duration-200 text-[#005461] resize-none"
                      [class.border-red-500]="profileForm.get('bio')?.invalid && profileForm.get('bio')?.touched">
            </textarea>
            <div class="flex justify-between mt-1">
              @if (profileForm.get('bio')?.invalid && profileForm.get('bio')?.touched) {
                <p class="text-red-500 text-sm">
                  @if (profileForm.get('bio')?.errors?.['required']) {
                    Bio is required
                  }
                  @if (profileForm.get('bio')?.errors?.['minlength']) {
                    Bio must be at least 50 characters
                  }
                </p>
              }
              <span class="text-sm text-gray-500 ml-auto">
                {{ profileForm.get('bio')?.value?.length || 0 }} / 1000
              </span>
            </div>
          </div>

          <!-- Error Message -->
          @if (errorMessage()) {
            <div class="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3 animate-shake">
              <svg class="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/>
              </svg>
              <p class="text-sm text-red-800">{{ errorMessage() }}</p>
            </div>
          }

          <!-- Submit Button -->
          <div class="flex gap-4">
            <button type="button"
                    (click)="skipForNow()"
                    class="flex-1 py-3.5 px-4 border-2 border-[#00B7B5] text-[#018790] font-semibold rounded-xl hover:bg-[#00B7B5] hover:bg-opacity-10 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#018790] transition-all duration-200">
              Skip for Now
            </button>
            <button type="submit"
                    [disabled]="loading() || profileForm.invalid"
                    class="flex-1 py-3.5 px-4 bg-gradient-to-r from-[#005461] to-[#018790] text-white font-semibold rounded-xl hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#00B7B5] transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none">
              @if (!loading()) {
                <span>Complete Profile</span>
              } @else {
                <span class="flex items-center justify-center gap-2">
                  <svg class="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Saving...
                </span>
              }
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [`
    @keyframes fade-in {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }
    @keyframes shake {
      0%, 100% { transform: translateX(0); }
      10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
      20%, 40%, 60%, 80% { transform: translateX(5px); }
    }
    .animate-fade-in { animation: fade-in 0.6s ease-out; }
    .animate-shake { animation: shake 0.5s ease-in-out; }
  `]
})
export class ProfileCompleteComponent implements OnInit {
  private fb = inject(FormBuilder);
  private authService: AuthService = inject(AuthService);
  private profileService = inject(ProfileService);
  private http = inject(HttpClient);
  private router = inject(Router);

  profileForm: FormGroup;
  loading = signal(false);
  errorMessage = signal<string | null>(null);
  uploadError = signal<string | null>(null);
  previewUrl = signal<string | null>(null);
  selectedFile = signal<File | null>(null);

  constructor() {
    this.profileForm = this.fb.group({
      phoneNumber: ['', [Validators.required, Validators.pattern(/^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/)]],
      bio: ['', [Validators.required, Validators.minLength(50), Validators.maxLength(1000)]]
    });
  }

  ngOnInit(): void {
    // Check if user is already authenticated and profile complete
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/auth/login']);
      return;
    }

    if (this.authService.isProfileComplete()) {
      this.navigateBasedOnRole();
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        this.uploadError.set('File size must be less than 5MB');
        return;
      }

      // Validate file type
      if (!file.type.startsWith('image/')) {
        this.uploadError.set('Please select an image file');
        return;
      }

      this.uploadError.set(null);
      this.selectedFile.set(file);

      // Create preview
      const reader = new FileReader();
      reader.onload = () => {
        this.previewUrl.set(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  }

  getProgress(): number {
    let progress = 0;
    if (this.selectedFile()) progress += 33;
    if (this.profileForm.get('phoneNumber')?.valid) progress += 33;
    if (this.profileForm.get('bio')?.valid) progress += 34;
    return progress;
  }

  async onSubmit(): Promise<void> {
    if (this.profileForm.invalid) {
      this.profileForm.markAllAsTouched();
      return;
    }

    if (!this.selectedFile()) {
      this.uploadError.set('Please upload a profile picture');
      return;
    }

    this.loading.set(true);
    this.errorMessage.set(null);

    // Upload image using ProfileService
    this.profileService.uploadProfileImage(this.selectedFile()!).subscribe({
      next: (uploadResponse) => {
        if (uploadResponse.success && uploadResponse.data) {
          // Update profile with image URL and other data
          const updateData = {
            phoneNumber: this.profileForm.value.phoneNumber,
            bio: this.profileForm.value.bio,
            profileImageUrl: uploadResponse.data.imageUrl
          };

          this.profileService.updateProfile(updateData).subscribe({
            next: (response) => {
              if (response.success && response.data) {
                // Update current user with the refreshed data from backend
                // The response.data is correctly typed as the User from auth.service
                this.authService.updateCurrentUser(response.data);

                // Small delay to ensure localStorage is written before navigation
                setTimeout(() => {
                  this.loading.set(false);
                  // Navigate based on role
                  this.navigateBasedOnRole();
                }, 100);
              }
            },
            error: (error) => {
              this.loading.set(false);
              console.error('Profile update error:', error);
              this.errorMessage.set(error.error?.message || 'Failed to update profile. Please try again.');
            }
          });
        }
      },
      error: (error) => {
        this.loading.set(false);
        console.error('Image upload error:', error);
        this.errorMessage.set(error.error?.message || 'Failed to upload image. Please try again.');
      }
    });
  }

  skipForNow(): void {
    this.navigateBasedOnRole();
  }

  private navigateBasedOnRole(): void {
    const user = this.authService.getCurrentUser();
    if (!user) {
      this.router.navigate(['/']);
      return;
    }

    // Navigate based on primary role
    if (user.authorities.includes('ROLE_ADMIN')) {
      this.router.navigate(['/admin/dashboard']);
    } else if (user.authorities.includes('ROLE_LANDLORD')) {
      this.router.navigate(['/profile/my-listings']); // Fixed: Navigate to my listings instead
    } else if (user.authorities.includes('ROLE_SERVICE_PROVIDER')) {
      this.router.navigate(['/service-offering/my-services']); // Fixed: Navigate to my services
    } else {
      this.router.navigate(['/']);
    }
  }
}
