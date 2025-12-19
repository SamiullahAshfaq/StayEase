import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ProfileService, UpdateProfileRequest } from '../../../core/services/profile.service';
import { User } from '../../../core/auth/auth.service';
import { ImageUrlHelper } from '../../../shared/utils/image-url.helper';

@Component({
  selector: 'app-profile-edit',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './profile-edit.component.html'
})
export class ProfileEditComponent implements OnInit {
  private profileService = inject(ProfileService);
  private router = inject(Router);
  private fb = inject(FormBuilder);

  profileForm!: FormGroup;
  user = signal<User | null>(null);
  loading = signal(true);
  saving = signal(false);
  error = signal<string | null>(null);
  success = signal(false);
  imagePreview = signal<string | null>(null);
  selectedFile = signal<File | null>(null);
  uploadingImage = signal(false);

  ngOnInit(): void {
    this.initForm();
    this.loadProfile();
  }

  initForm(): void {
    this.profileForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      phoneNumber: [''],
      bio: ['', Validators.maxLength(1000)]
    });
  }

  loadProfile(): void {
    this.loading.set(true);
    this.error.set(null);

    this.profileService.getProfile().subscribe({
      next: (response) => {
        const user = response.data;
        this.user.set(user);
        // Convert backend URL to full URL
        if (user.profileImageUrl) {
          this.imagePreview.set(ImageUrlHelper.getFullImageUrl(user.profileImageUrl));
        } else {
          this.imagePreview.set(null);
        }

        // Populate form
        this.profileForm.patchValue({
          firstName: user.firstName,
          lastName: user.lastName,
          phoneNumber: user.phoneNumber || '',
          bio: user.bio || ''
        });

        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err.error?.message || 'Failed to load profile');
        this.loading.set(false);
      }
    });
  }

  onFileSelect(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];

      // Validate file type
      if (!file.type.startsWith('image/')) {
        this.error.set('Please select a valid image file');
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        this.error.set('Image size must be less than 5MB');
        return;
      }

      this.selectedFile.set(file);

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        this.imagePreview.set(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  }

  uploadImage(): void {
    const file = this.selectedFile();
    if (!file) return;

    this.uploadingImage.set(true);
    this.error.set(null);

    this.profileService.uploadProfileImage(file).subscribe({
      next: (response) => {
        this.imagePreview.set(response.data.imageUrl);
        this.selectedFile.set(null);
        this.uploadingImage.set(false);
        this.success.set(true);
        setTimeout(() => this.success.set(false), 3000);
      },
      error: (err) => {
        this.error.set(err.error?.message || 'Failed to upload image');
        this.uploadingImage.set(false);
      }
    });
  }

  removeImage(): void {
    if (!confirm('Are you sure you want to remove your profile picture?')) {
      return;
    }

    this.uploadingImage.set(true);
    this.error.set(null);

    this.profileService.deleteProfileImage().subscribe({
      next: () => {
        this.imagePreview.set(null);
        this.selectedFile.set(null);
        this.uploadingImage.set(false);
        this.success.set(true);
        setTimeout(() => this.success.set(false), 3000);
      },
      error: (err) => {
        this.error.set(err.error?.message || 'Failed to remove image');
        this.uploadingImage.set(false);
      }
    });
  }

  saveProfile(): void {
    if (this.profileForm.invalid) {
      this.profileForm.markAllAsTouched();
      return;
    }

    // Upload image first if there's a selected file
    if (this.selectedFile()) {
      this.uploadImage();
    }

    this.saving.set(true);
    this.error.set(null);
    this.success.set(false);

    const formData = this.profileForm.value;
    const updateData: UpdateProfileRequest = {
      firstName: formData.firstName,
      lastName: formData.lastName,
      phoneNumber: formData.phoneNumber || undefined,
      bio: formData.bio || undefined
    };

    this.profileService.updateProfile(updateData).subscribe({
      next: () => {
        this.saving.set(false);
        this.success.set(true);
        setTimeout(() => {
          this.router.navigate(['/profile/view']);
        }, 1500);
      },
      error: (err) => {
        this.error.set(err.error?.message || 'Failed to update profile');
        this.saving.set(false);
      }
    });
  }

  cancel(): void {
    if (this.profileForm.dirty && !confirm('You have unsaved changes. Are you sure you want to leave?')) {
      return;
    }
    this.router.navigate(['/profile/view']);
  }

  getInitials(user: User): string {
    return `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase();
  }

  getFieldError(field: string): string {
    const control = this.profileForm.get(field);
    if (control?.hasError('required')) return 'This field is required';
    if (control?.hasError('minlength')) return 'Too short';
    if (control?.hasError('maxlength')) return 'Too long';
    if (control?.hasError('email')) return 'Invalid email';
    return '';
  }

  isFieldInvalid(field: string): boolean {
    const control = this.profileForm.get(field);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }
}
