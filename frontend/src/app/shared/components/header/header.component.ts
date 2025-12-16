import { Component, inject, OnInit, PLATFORM_ID, signal, HostListener } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService, User } from '../../../core/auth/auth.service';

interface GuestCount {
  adults: number;
  children: number;
  infants: number;
}

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent implements OnInit {
  private platformId = inject(PLATFORM_ID);
  authService = inject(AuthService);
  router = inject(Router);

  // Menu states
  isMenuOpen = false;
  isSearchExpanded = signal(false);
  activeSearchSection = signal<'where' | 'when' | 'who' | null>(null);

  // Reactive properties
  currentUser: User | null = null;
  isAuthenticated = false;

  // Search inputs
  searchDestination = signal('');
  checkInDate = signal<Date | null>(null);
  checkOutDate = signal<Date | null>(null);
  guests = signal<GuestCount>({ adults: 1, children: 0, infants: 0 });

  // Date picker state
  currentMonth = signal(new Date());
  selectedStartDate = signal<Date | null>(null);
  selectedEndDate = signal<Date | null>(null);

  ngOnInit() {
    // Only initialize auth state in browser
    if (isPlatformBrowser(this.platformId)) {
      // Initial state
      this.updateAuthState();

      // Subscribe to user changes with ChangeDetectorRef to prevent NG0100
      this.authService.currentUser$.subscribe(() => {
        // Use setTimeout to defer state update to next change detection cycle
        setTimeout(() => {
          this.updateAuthState();
        }, 0);
      });
    }
  }

  private updateAuthState() {
    this.currentUser = this.authService.getCurrentUser();
    this.isAuthenticated = this.authService.isAuthenticated();
    console.log('Header - Auth state updated');
    console.log('Header - isAuthenticated:', this.isAuthenticated);
    console.log('Header - currentUser:', this.currentUser);
  }

  // Search section handlers
  setActiveSection(section: 'where' | 'when' | 'who' | null) {
    this.activeSearchSection.set(section);
    if (section) {
      this.isSearchExpanded.set(true);
    }
  }

  closeSearch() {
    this.isSearchExpanded.set(false);
    this.activeSearchSection.set(null);
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const target = event.target as HTMLElement;

    // Close search if clicking outside
    if (!target.closest('.search-container')) {
      this.closeSearch();
    }

    // Close menu if clicking outside
    if (!target.closest('.user-menu') && !target.closest('.auth-menu') && this.isMenuOpen) {
      this.isMenuOpen = false;
    }
  }

  // Guest counter methods
  incrementGuests(type: keyof GuestCount) {
    const current = this.guests();
    this.guests.set({ ...current, [type]: current[type] + 1 });
  }

  decrementGuests(type: keyof GuestCount) {
    const current = this.guests();
    if (current[type] > (type === 'adults' ? 1 : 0)) {
      this.guests.set({ ...current, [type]: current[type] - 1 });
    }
  }

  getTotalGuests(): number {
    const g = this.guests();
    return g.adults + g.children;
  }

  getGuestText(): string {
    const total = this.getTotalGuests();
    const infants = this.guests().infants;
    let text = `${total} guest${total !== 1 ? 's' : ''}`;
    if (infants > 0) {
      text += `, ${infants} infant${infants !== 1 ? 's' : ''}`;
    }
    return text;
  }

  // Date picker methods
  getDaysInMonth(date: Date): Date[] {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days: Date[] = [];

    // Add empty slots for days before month starts
    const startDay = firstDay.getDay();
    for (let i = 0; i < startDay; i++) {
      days.push(new Date(0));
    }

    // Add all days in month
    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push(new Date(year, month, i));
    }

    return days;
  }

  selectDate(date: Date) {
    if (date.getTime() === 0) return;

    const start = this.selectedStartDate();
    const end = this.selectedEndDate();

    if (!start || (start && end)) {
      // Starting new selection
      this.selectedStartDate.set(date);
      this.selectedEndDate.set(null);
      this.checkInDate.set(date);
      this.checkOutDate.set(null);
    } else if (start && !end) {
      // Completing selection
      if (date > start) {
        this.selectedEndDate.set(date);
        this.checkOutDate.set(date);
      } else {
        this.selectedStartDate.set(date);
        this.selectedEndDate.set(null);
        this.checkInDate.set(date);
        this.checkOutDate.set(null);
      }
    }
  }

  isDateInRange(date: Date): boolean {
    if (date.getTime() === 0) return false;
    const start = this.selectedStartDate();
    const end = this.selectedEndDate();
    if (!start || !end) return false;
    return date > start && date < end;
  }

  isDateSelected(date: Date): boolean {
    if (date.getTime() === 0) return false;
    const start = this.selectedStartDate();
    const end = this.selectedEndDate();
    return !!(start && date.getTime() === start.getTime()) || !!(end && date.getTime() === end.getTime());
  }

  nextMonth() {
    const current = this.currentMonth();
    this.currentMonth.set(new Date(current.getFullYear(), current.getMonth() + 1, 1));
  }

  previousMonth() {
    const current = this.currentMonth();
    this.currentMonth.set(new Date(current.getFullYear(), current.getMonth() - 1, 1));
  }

  getMonthName(date: Date): string {
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  }

  // Navigation and auth
  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }

  login() {
    this.router.navigate(['/auth/login']);
    this.isMenuOpen = false;
  }

  signup() {
    this.router.navigate(['/auth/register']);
    this.isMenuOpen = false;
  }

  navigateToBookings() {
    this.router.navigate(['/booking/list']);
    this.isMenuOpen = false;
  }

  navigateToProfile() {
    this.router.navigate(['/profile']);
    this.isMenuOpen = false;
  }

  navigateToMyListings() {
    this.router.navigate(['/landlord/listings']);
    this.isMenuOpen = false;
  }

  navigateToAddListing() {
    this.router.navigate(['/listing/create']);
    this.isMenuOpen = false;
  }

  navigateToMyServices() {
    this.router.navigate(['/service-offering/dashboard']);
    this.isMenuOpen = false;
  }

  navigateToAddService() {
    this.router.navigate(['/service-offering/create']);
    this.isMenuOpen = false;
  }

  // Check if user is landlord or admin
  isLandlordOrAdmin(): boolean {
    if (!this.currentUser || !this.currentUser.authorities) {
      return false;
    }
    const authorities = this.currentUser.authorities;
    return authorities.includes('ROLE_LANDLORD') || authorities.includes('ROLE_ADMIN');
  }

  // Check if user is service provider
  isServiceProvider(): boolean {
    if (!this.currentUser || !this.currentUser.authorities) {
      return false;
    }
    const authorities = this.currentUser.authorities;
    return authorities.includes('ROLE_SERVICE_PROVIDER') || authorities.includes('ROLE_ADMIN');
  }

  logout() {
    this.authService.logout();
    this.isMenuOpen = false;
    this.router.navigate(['/']);
  }

  // Get primary role for display
  getPrimaryRole(): string {
    if (!this.currentUser || !this.currentUser.authorities || this.currentUser.authorities.length === 0) {
      return 'User';
    }

    // Priority order: ADMIN > LANDLORD > SERVICE_PROVIDER > TENANT
    const authorities = this.currentUser.authorities;

    if (authorities.includes('ROLE_ADMIN')) {
      return 'Admin';
    } else if (authorities.includes('ROLE_LANDLORD')) {
      return 'Landlord';
    } else if (authorities.includes('ROLE_SERVICE_PROVIDER')) {
      return 'Service Provider';
    } else if (authorities.includes('ROLE_TENANT')) {
      return 'Tenant';
    }

    // Fallback: format the first authority
    const firstAuthority = authorities[0];
    return firstAuthority.replace('ROLE_', '')
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  }

  // Search action
  performSearch() {
    const queryParams: Record<string, unknown> = {};

    if (this.searchDestination()) {
      queryParams['location'] = this.searchDestination();
    }
    if (this.checkInDate()) {
      queryParams['checkIn'] = this.checkInDate()?.toISOString();
    }
    if (this.checkOutDate()) {
      queryParams['checkOut'] = this.checkOutDate()?.toISOString();
    }
    if (this.guests()) {
      queryParams['guests'] = this.guests();
    }

    this.closeSearch();
    // Navigate to listings search with query params
    this.router.navigate(['/listing/search'], { queryParams });
  }
}
