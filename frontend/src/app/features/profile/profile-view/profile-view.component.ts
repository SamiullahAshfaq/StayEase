import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { ProfileService } from '../../../core/services/profile.service';
import { User } from '../../../core/auth/auth.service';

@Component({
  selector: 'app-profile-view',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './profile-view.component.html'
})
export class ProfileViewComponent implements OnInit {
  private profileService = inject(ProfileService);
  private router = inject(Router);

  user = signal<User | null>(null);
  loading = signal(true);
  error = signal<string | null>(null);

  ngOnInit(): void {
    this.loadProfile();
  }

  loadProfile(): void {
    this.loading.set(true);
    this.error.set(null);

    this.profileService.getProfile().subscribe({
      next: (response) => {
        this.user.set(response.data);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err.error?.message || 'Failed to load profile');
        this.loading.set(false);
      }
    });
  }

  editProfile(): void {
    this.router.navigate(['/profile/edit']);
  }

  formatDate(date: string | undefined): string {
    if (!date) return 'Not provided';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  formatAuthorities(authorities: string[]): string {
    return authorities
      .map(auth => auth.replace('ROLE_', ''))
      .map(role => role.charAt(0) + role.slice(1).toLowerCase())
      .join(', ');
  }

  getInitials(user: User): string {
    return `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase();
  }
}
